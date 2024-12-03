import { Node } from '../../models/engine/node.model';
import { Schema } from '../../models/engine/schema.model';
import { Rule } from '../../models/engine/rule.model';
import { NodeAction } from '../../models/engine/node.action.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { NodeMapper } from '../../mappers/engine/node.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    YesNoNodeCreateModel,
    NodeCreateModel,
    NodeResponseDto,
    NodeSearchFilters,
    NodeSearchResults,
    NodeUpdateModel,
    QuestionNodeCreateModel } from '../../../domain.types/engine/node.types';
import { CommonUtilsService } from './common.utils.service';
import { NodeType } from '../../../domain.types/engine/engine.enums';
import { Question } from '../../../database/models/engine/question.model';
import { StringUtils } from '../../../common/utilities/string.utils';
import { NodeActionCreateModel, NodeActionResponseDto } from '../../../domain.types/engine/node.action.types';
import { NodeActionMapper } from '../../../database/mappers/engine/node.action.mapper';

///////////////////////////////////////////////////////////////////////

export class NodeService extends BaseService {

    //#region Repositories

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _schemaRepository: Repository<Schema> = Source.getRepository(Schema);

    _questionRepository: Repository<Question> = Source.getRepository(Question);

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    _actionRepository: Repository<NodeAction> = Source.getRepository(NodeAction);

    _commonUtils: CommonUtilsService = new CommonUtilsService();

    //#endregion

    public create = async (createModel: NodeCreateModel | QuestionNodeCreateModel | YesNoNodeCreateModel)
        : Promise<NodeResponseDto> => {
        const schema = await this._commonUtils.getSchema(createModel.SchemaId);
        const parentNode = await this.getNode(createModel.ParentNodeId);
        const prefix = createModel.Type === NodeType.QuestionNode ? 'QNODE' : 'ENODE';

        var yesAction = await this.createAction(createModel.Type === NodeType.YesNoNode ? (createModel as YesNoNodeCreateModel).YesAction : null);
        var noAction = await this.createAction(createModel.Type === NodeType.YesNoNode ? (createModel as YesNoNodeCreateModel).NoAction : null);

        const node = this._nodeRepository.create({
            Code         : StringUtils.generateDisplayCode_RandomChars(12, prefix),
            Type         : createModel.Type,
            Schema       : schema,
            ParentNode   : parentNode,
            Name         : createModel.Name,
            Description  : createModel.Description,
            DelaySeconds : createModel.DelaySeconds,
            RuleId       : createModel.RuleId,
            RawData      : createModel.RawData,
            Input        : createModel.Input,
            YesActionId  : yesAction ? yesAction.id : null,
            NoActionId   : noAction ? noAction.id : null,
        });
        var record = await this._nodeRepository.save(node);
        if (record == null)
        {
            return null;
        }
        var nodeId = record.id;
        var model = null;
        if (createModel.Type === NodeType.QuestionNode) {
            model = createModel as QuestionNodeCreateModel;
            var questionModel = {
                id           : nodeId,
                QuestionText : model.QuestionText,
                ResponseType : model.ResponseType,
                Options      : model.Options,
            };
            var question = await this._questionRepository.create(questionModel);
            var questionRecord = await this._questionRepository.save(question);
            logger.info(JSON.stringify(questionRecord, null, 2));
        }

        var nodeActions: NodeActionResponseDto[] = [];
        for await (const action of createModel.Actions) {
            var actionRecord = await this.createAction(action);
            var actionDto = NodeActionMapper.toResponseDto(actionRecord);
            nodeActions.push(actionDto);
        }
        const yesActionDto = yesAction ? NodeActionMapper.toResponseDto(yesAction) : null;
        const noActionDto = noAction ? NodeActionMapper.toResponseDto(noAction) : null;

        return NodeMapper.toResponseDto(record, nodeActions, question, yesActionDto, noActionDto);
    };

    public getById = async (id: uuid): Promise<NodeResponseDto> => {
        try {
            var node = await this._nodeRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Actions         : true,
                    ParentNode      : true,
                    Schema          : true,
                    Paths           : true,
                    Children        : true,
                    DefaultNodePath : true,
                }
            });

            var yesActionDto: NodeActionResponseDto = null;
            var noActionDto: NodeActionResponseDto = null;
            var question: Question = null;
            if (node && node.YesActionId) {
                var yesAction = await this._actionRepository.findOne({
                    where : {
                        id : node.YesActionId
                    }
                });
                yesActionDto = NodeActionMapper.toResponseDto(yesAction);
            }
            if (node && node.NoActionId) {
                var noAction = await this._actionRepository.findOne({
                    where : {
                        id : node.NoActionId
                    }
                });
                noActionDto = NodeActionMapper.toResponseDto(noAction);
            }
            if (node && node.Type === NodeType.QuestionNode) {
                question = await this._questionRepository.findOne({
                    where : {
                        id : id
                    }
                });
            }
            var nodeActions = await this.getNodeActions(id);
            return NodeMapper.toResponseDto(node, nodeActions, question, yesActionDto, noActionDto);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: NodeSearchFilters)
        : Promise<NodeSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._nodeRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => NodeMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: NodeUpdateModel)
        : Promise<NodeResponseDto> => {
        try {
            const node = await this._nodeRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Actions         : true,
                    ParentNode      : true,
                    Schema          : true,
                    Paths           : true,
                    Children        : true,
                    DefaultNodePath : true,
                }
            });
            if (!node) {
                ErrorHandler.throwNotFoundError('Node not found!');
            }
            if (model.SchemaId != null) {
                const schema = await this._commonUtils.getSchema(model.SchemaId);
                node.Schema = schema;
            }
            if (model.ParentNodeId != null) {
                const parentNode = await this.getNode(model.ParentNodeId);
                node.ParentNode = parentNode;
            }
            if (model.Name != null) {
                node.Name = model.Name;
            }
            if (model.Description != null) {
                node.Description = model.Description;
            }
            var record = await this._nodeRepository.save(node);
            return NodeMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._nodeRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._nodeRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public setNextNode = async (id: uuid, nextNodeId: uuid): Promise<boolean> => {
        try {
            var node = await this._nodeRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!node) {
                ErrorHandler.throwNotFoundError('Node not found!');
            }
            var nextNode = await this._nodeRepository.findOne({
                where : {
                    id : nextNodeId
                }
            });
            if (!nextNode) {
                ErrorHandler.throwNotFoundError('Next Node not found!');
            }
            node.NextNodeId = nextNodeId;
            var result = await this._nodeRepository.save(node);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getNodeActions = async (nodeId: uuid): Promise<NodeActionResponseDto[]> => {
        try {
            var node = await this._nodeRepository.findOne({
                where : {
                    id : nodeId
                }
            });
            if (!node) {
                ErrorHandler.throwNotFoundError('Node not found!');
            }
            var actions = await this._actionRepository.find({
                where : {
                    ParentNode : {
                        id : nodeId
                    }
                }
            });
            return actions.map(x => NodeActionMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: NodeSearchFilters) => {

        var search : FindManyOptions<Node> = {
            relations : {
            },
            where : {
            },
            select : {
                id          : true,
                Name        : true,
                Description : true,
                Schema      : {
                    id          : true,
                    Name        : true,
                    Description : true,
                },
                ParentNode : {
                    id          : true,
                    Name        : true,
                    Description : true,
                },
                CreatedAt : true,
                UpdatedAt : true,
            }
        };

        if (filters.SchemaId) {
            search.where['Schema'].id = filters.SchemaId;
        }
        if (filters.ParentNodeId) {
            search.where['ParentNode'].id = filters.ParentNodeId;
        }
        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
        }

        return search;
    };

    //#endregion

    private async getNode(nodeId: uuid) {
        if (!nodeId) {
            return null;
        }
        const node = await this._nodeRepository.findOne({
            where : {
                id : nodeId
            }
        });
        if (!node) {
            ErrorHandler.throwNotFoundError('Node cannot be found');
        }
        return node;
    }

    private async createAction(actionModel?: NodeActionCreateModel): Promise<NodeAction> {
        if (actionModel == null) {
            return null;
        }
        var action = await this._actionRepository.create(actionModel);
        var actionRecord = await this._actionRepository.save(action);
        return actionRecord;
    }

}
