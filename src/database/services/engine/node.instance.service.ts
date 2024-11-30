import { NodeInstance } from '../../models/engine/node.instance.model';
import { Node } from '../../models/engine/node.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Repository } from 'typeorm';
import { NodeInstanceMapper } from '../../mappers/engine/node.instance.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    NodeInstanceCreateModel,
    NodeInstanceResponseDto,
    NodeInstanceSearchFilters,
    NodeInstanceSearchResults,
    NodeInstanceUpdateModel } from '../../../domain.types/engine/node.instance.types';
import { SchemaInstance } from '../../models/engine/schema.instance.model';

///////////////////////////////////////////////////////////////////////

export class NodeInstanceService extends BaseService {

    //#region Repositories

    _nodeInstanceRepository: Repository<NodeInstance> = Source.getRepository(NodeInstance);

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _schemaInstanceRepository: Repository<SchemaInstance> = Source.getRepository(SchemaInstance);

    //#endregion

    public create = async (createModel: NodeInstanceCreateModel)
        : Promise<NodeInstanceResponseDto> => {

        const node = await this.getNode(createModel.NodeId);
        const schemaInstance = await this.getSchemaInstance(createModel.SchemaInstanceId);

        const nodeInstance = this._nodeInstanceRepository.create({
            Node           : node,
            SchemaInstance : schemaInstance,
        });
        var record = await this._nodeInstanceRepository.save(nodeInstance);
        return NodeInstanceMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<NodeInstanceResponseDto> => {
        try {
            var nodeInstance = await this._nodeInstanceRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    SchemaInstance : {
                        Schema : true,
                    },
                    ChildrenNodeInstances : {
                        Node : true
                    },
                    Node               : true,
                    ParentNodeInstance : {
                        Node : true
                    }
                },
            });
            return NodeInstanceMapper.toResponseDto(nodeInstance);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: NodeInstanceSearchFilters)
        : Promise<NodeInstanceSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._nodeInstanceRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => NodeInstanceMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: NodeInstanceUpdateModel)
        : Promise<NodeInstanceResponseDto> => {
        try {
            const nodeInstance = await this._nodeInstanceRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!nodeInstance) {
                ErrorHandler.throwNotFoundError('NodeInstance not found!');
            }
            if (model.NodeId != null) {
                const node = await this.getNode(model.NodeId);
                nodeInstance.Node = node;
            }
            if (model.SchemaInstanceId != null) {
                const schemaInstance = await this.getSchemaInstance(model.SchemaInstanceId);
                nodeInstance.SchemaInstance = schemaInstance;
            }
            var record = await this._nodeInstanceRepository.save(nodeInstance);
            return NodeInstanceMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._nodeInstanceRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._nodeInstanceRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: NodeInstanceSearchFilters) => {

        var search : FindManyOptions<NodeInstance> = {
            relations : {
                SchemaInstance        : true,
                ChildrenNodeInstances : true,
                Node                  : true,
                ParentNodeInstance    : true
            },
            where : {
            },
            select : {
                id   : true,
                Node : {
                    id          : true,
                    Name        : true,
                    Description : true,
                    Actions     : {
                        id     : true,
                        Name   : true,
                        Type   : true,
                        Input  : {},
                        Output : {},
                    },
                },
                ExecutionResult       : true,
                ExecutionStatus       : true,
                StatusUpdateTimestamp : true,
                Executed              : true,
                SchemaInstance        : {
                    id     : true,
                    Schema : {
                        id   : true,
                        Name : true,
                    },
                },
                ParentNodeInstance : {
                    id   : true,
                    Node : {
                        id   : true,
                        Name : true,
                    },
                },
                ChildrenNodeInstances : {
                    id   : true,
                    Node : {
                        id   : true,
                        Name : true,
                    },
                },
                CreatedAt : true,
                UpdatedAt : true,
            }
        };

        if (filters.NodeId) {
            search.where['Node'].id = filters.NodeId;
        }
        if (filters.SchemaInstanceId) {
            search.where['SchemaInstance'].id = filters.SchemaInstanceId;
        }

        return search;
    };

    //#endregion

    private async getNode(nodeId: uuid) {
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

    private async getSchemaInstance(schemaInstanceId: uuid) {
        const schemaInstance = await this._schemaInstanceRepository.findOne({
            where : {
                id : schemaInstanceId
            }
        });
        if (!schemaInstance) {
            ErrorHandler.throwNotFoundError('Schema instance cannot be found');
        }
        return schemaInstance;
    }

}
