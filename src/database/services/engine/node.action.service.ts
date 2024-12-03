import { Node } from '../../models/engine/node.model';
import { Schema } from '../../models/engine/schema.model';
import { Rule } from '../../models/engine/rule.model';
import { NodeAction } from '../../models/engine/node.action.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    NodeActionCreateModel,
    NodeActionResponseDto,
    NodeActionSearchFilters,
    NodeActionSearchResults,
    NodeActionUpdateModel } from '../../../domain.types/engine/node.action.types';
import { CommonUtilsService } from './common.utils.service';
import { NodeActionMapper } from '../../../database/mappers/engine/node.action.mapper';

///////////////////////////////////////////////////////////////////////

export class NodeActionService extends BaseService {

    //#region Repositories

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _actionRepository: Repository<NodeAction> = Source.getRepository(NodeAction);

    _schemaRepository: Repository<Schema> = Source.getRepository(Schema);

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    _commonUtils: CommonUtilsService = new CommonUtilsService();

    //#endregion

    public create = async (createModel: NodeActionCreateModel)
        : Promise<NodeActionResponseDto> => {

        const parentNode = await this.getNode(createModel.ParentNodeId);

        const node = this._actionRepository.create({
            ParentNode  : parentNode,
            Type        : createModel.Type,
            Name        : createModel.Name,
            Description : createModel.Description,
            Input       : createModel.Input,
            Output      : createModel.Output,
        });
        var record = await this._actionRepository.save(node);
        return NodeActionMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<NodeActionResponseDto> => {
        try {
            var node = await this._actionRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    ParentNode : true,
                }
            });
            return NodeActionMapper.toResponseDto(node);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: NodeActionSearchFilters)
        : Promise<NodeActionSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._actionRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => NodeActionMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: NodeActionUpdateModel)
        : Promise<NodeActionResponseDto> => {
        try {
            const action = await this._actionRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    ParentNode : true,
                }
            });
            if (!action) {
                ErrorHandler.throwNotFoundError('Node not found!');
            }
            if (model.ParentNodeId != null) {
                const parentNode = await this.getNode(model.ParentNodeId);
                action.ParentNode = parentNode;
            }
            if (model.Name != null) {
                action.Name = model.Name;
            }
            if (model.Description != null) {
                action.Description = model.Description;
            }
            if (model.Input != null) {
                action.Input = model.Input;
            }
            if (model.Output != null) {
                action.Output = model.Output;
            }
            var record = await this._actionRepository.save(action);
            return NodeActionMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: uuid): Promise<boolean> => {
        try {
            var record = await this._actionRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._actionRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getNodeActions = async (nodeId: uuid): Promise<NodeActionResponseDto[]> => {
        try {
            const actions = await this._actionRepository.find({
                where : {
                    ParentNode : {
                        id : nodeId
                    }
                },
                relations : {
                    ParentNode : true,
                }
            });
            return actions.map(x => NodeActionMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: NodeActionSearchFilters) => {

        var search : FindManyOptions<NodeAction> = {
            relations : {
            },
            where : {
            },
            select : {
                id          : true,
                Name        : true,
                Description : true,
                ParentNode  : {
                    id          : true,
                    Name        : true,
                    Description : true,
                },
                Input : {
                    Params : true,
                },
                Output : {
                    Params : true,
                },
                CreatedAt : true,
                UpdatedAt : true,
            }
        };

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

}
