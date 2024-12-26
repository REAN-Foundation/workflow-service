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
import { CommonUtilsService } from './common.utils.service';
import { NodePath } from '../../../database/models/engine/node.path.model';
import { NodePathCreateModel, NodePathResponseDto, NodePathSearchFilters, NodePathSearchResults, NodePathUpdateModel } from '../../../domain.types/engine/node.path.types';
import { NodePathMapper } from '../../../database/mappers/engine/node.path.mapper';

///////////////////////////////////////////////////////////////////////

export class NodePathService extends BaseService {

    //#region Repositories

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _pathRepository: Repository<NodePath> = Source.getRepository(NodePath);

    _schemaRepository: Repository<Schema> = Source.getRepository(Schema);

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    _actionRepository: Repository<NodeAction> = Source.getRepository(NodeAction);

    _commonUtils: CommonUtilsService = new CommonUtilsService();

    //#endregion

    public create = async (createModel: NodePathCreateModel)
        : Promise<NodePathResponseDto> => {
        const parentNode = await this.getNode(createModel.ParentNodeId);

        const path = this._pathRepository.create({
            ParentNode  : parentNode,
            Name        : createModel.Name,
            Description : createModel.Description,
        });
        var record = await this._pathRepository.save(path);
        return NodePathMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<NodePathResponseDto> => {
        try {
            var path = await this._pathRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    ParentNode : true,
                    Rule       : true,
                }
            });
            return NodePathMapper.toResponseDto(path);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: NodePathSearchFilters)
        : Promise<NodePathSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._pathRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => NodePathMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: NodePathUpdateModel)
        : Promise<NodePathResponseDto> => {
        try {
            const node = await this._pathRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!node) {
                ErrorHandler.throwNotFoundError('Node path not found!');
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

            var record = await this._pathRepository.save(node);
            return NodePathMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._pathRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._pathRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getNodePaths = async (nodeId: uuid): Promise<NodePathResponseDto[]> => {
        try {
            const paths = await this._pathRepository.find({
                where : {
                    ParentNode : {
                        id : nodeId
                    }
                },
                relations : {
                    ParentNode : true,
                    Rule       : true,
                }
            });
            return paths.map(x => NodePathMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public setNextNodeToPath = async (pathId: uuid, nextNodeId: uuid): Promise<boolean> => {
        try {
            const path = await this._pathRepository.findOne({
                where : {
                    id : pathId
                }
            });
            if (!path) {
                ErrorHandler.throwNotFoundError('Node path not found!');
            }
            const nextNode = await this.getNode(nextNodeId);
            path.NextNode = nextNode;
            var record = await this._pathRepository.save(path);
            if (!record) {
                ErrorHandler.throwInternalServerError('Unable to set next node to path!');
            }
            return true;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: NodePathSearchFilters) => {

        var search : FindManyOptions<NodePath> = {
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
                Rule : {
                    id          : true,
                    Name        : true,
                    Description : true,
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
