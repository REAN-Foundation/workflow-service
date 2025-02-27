import { SchemaInstance } from '../../models/engine/schema.instance.model';
import { Schema } from '../../models/engine/schema.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { SchemaInstanceMapper } from '../../mappers/engine/schema.instance.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    SchemaInstanceCreateModel,
    SchemaInstanceResponseDto,
    SchemaInstanceSearchFilters,
    SchemaInstanceSearchResults,
    SchemaInstanceUpdateModel } from '../../../domain.types/engine/schema.instance.types';
import { NodeInstance } from '../../models/engine/node.instance.model';
import { Node } from '../../models/engine/node.model';
import { DatabaseUtilsService } from './database.utils.service';
import { NodeActionInstance } from '../../../database/models/engine/node.action.instance.model';
import { Params } from '../../../domain.types/engine/params.types';
import { ExecutionStatus, WorkflowActivityType } from '../../../domain.types/engine/engine.enums';
import { SchemaInstanceActivity } from '../../../database/models/engine/schema.instance.activity.model';

///////////////////////////////////////////////////////////////////////

export class SchemaInstanceService extends BaseService {

    //#region Repositories

    _schemaInstanceRepository: Repository<SchemaInstance> = Source.getRepository(SchemaInstance);

    _schemaRepository: Repository<Schema> = Source.getRepository(Schema);

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _nodeInstanceRepository: Repository<NodeInstance> = Source.getRepository(NodeInstance);

    _nodeActionInstanceRepository: Repository<NodeActionInstance> = Source.getRepository(NodeActionInstance);

    _schemaInstanceActivityRepository: Repository<SchemaInstanceActivity> = Source.getRepository(SchemaInstanceActivity);

    _commonUtilsService: DatabaseUtilsService = new DatabaseUtilsService();

    //#endregion

    public create = async (createModel: SchemaInstanceCreateModel)
        : Promise<SchemaInstanceResponseDto> => {

        const schema = await this._commonUtilsService.getSchema(createModel.SchemaId);
        const rootNode = await this._commonUtilsService.getNode(schema.RootNodeId);

        const schemaInstance = this._schemaInstanceRepository.create({
            TenantId               : createModel.TenantId,
            Code                   : createModel.Code,
            ContextParams          : createModel.ContextParams,
            Schema                 : schema,
            ParentSchemaInstanceId : createModel.ParentSchemaInstanceId ?? null,
        });
        var record = await this._schemaInstanceRepository.save(schemaInstance);

        //Create root node instance
        const rootNodeInstance = await this._nodeInstanceRepository.create({
            Node            : rootNode,
            SchemaInstance  : schemaInstance,
            Type            : rootNode.Type,
            ExecutionStatus : ExecutionStatus.Pending,
        });
        const rootNodeInstanceRecord = await this._nodeInstanceRepository.save(rootNodeInstance);

        //Add action instances to the root node instance
        await this._commonUtilsService.getOrCreateNodeActionInstances(rootNodeInstanceRecord.id);

        record.RootNodeInstance = rootNodeInstanceRecord;
        record.CurrentNodeInstance = rootNodeInstanceRecord;
        record.AlmanacObjects = [];
        record = await this._schemaInstanceRepository.save(record);

        return await this.getById(record.id);
    };

    public getById = async (id: uuid): Promise<SchemaInstanceResponseDto> => {
        try {
            var schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Schema : {
                        Nodes : true,
                    },
                    CurrentNodeInstance : {
                        Node : true,
                    },
                    RootNodeInstance : {
                        Node : true,
                    },
                    NodeInstances : {
                        Node : true,
                    },
                }
            });
            return SchemaInstanceMapper.toResponseDto(schemaInstance);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getBySchemaId = async (schemaId: uuid): Promise<SchemaInstanceResponseDto[]> => {
        try {
            var schemaInstances = await this._schemaInstanceRepository.find({
                where : {
                    Schema : {
                        id : schemaId
                    }
                },
                relations : {
                    Schema : {
                        Nodes : true,
                    },
                    CurrentNodeInstance : {
                        Node : true,
                    },
                    RootNodeInstance : {
                        Node : true,
                    },
                    NodeInstances : {
                        Node : true,
                    },
                }
            });
            return schemaInstances.map(x => SchemaInstanceMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getByParentSchemaInstanceId = async (parentSchemaInstanceId: uuid): Promise<SchemaInstanceResponseDto[]> => {
        try {
            var schemaInstances = await this._schemaInstanceRepository.find({
                where : {
                    ParentSchemaInstanceId : parentSchemaInstanceId
                },
                relations : {
                    Schema : {
                        Nodes : true,
                    },
                    CurrentNodeInstance : {
                        Node : true,
                    },
                    RootNodeInstance : {
                        Node : true,
                    },
                    NodeInstances : {
                        Node : true,
                    },
                }
            });
            return schemaInstances.map(x => SchemaInstanceMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public setCurrentNodeInstance = async (schemaInstanceId: uuid, nodeInstanceId: uuid): Promise<void> => {
        try {
            var schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : schemaInstanceId
                }
            });
            if (!schemaInstance) {
                ErrorHandler.throwNotFoundError('SchemaInstance not found!');
            }
            var nodeInstance = await this._nodeInstanceRepository.findOne({
                where : {
                    id : nodeInstanceId
                }
            });
            if (!nodeInstance) {
                ErrorHandler.throwNotFoundError('NodeInstance not found!');
            }
            schemaInstance.CurrentNodeInstance = nodeInstance;
            await this._schemaInstanceRepository.save(schemaInstance);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getCurrentNodeInstanceId = async (schemaInstanceId: uuid): Promise<uuid> => {
        try {
            var schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : schemaInstanceId
                },
                relations : {
                    CurrentNodeInstance : true
                }
            });
            if (!schemaInstance) {
                ErrorHandler.throwNotFoundError('SchemaInstance not found!');
            }
            var currentNodeInstance = schemaInstance.CurrentNodeInstance;
            if (!currentNodeInstance) {
                return null;
            }
            return schemaInstance.CurrentNodeInstance.id;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getCount = async (tenantId: uuid, schemaId: uuid, pattern: string) => {
        try {
            var count = await this._schemaInstanceRepository.count({
                where : {
                    TenantId : tenantId,
                    Schema   : {
                        id : schemaId
                    },
                    Code : Like(`%${pattern}%`)
                }
            });
            return count;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: SchemaInstanceSearchFilters)
        : Promise<SchemaInstanceSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._schemaInstanceRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => SchemaInstanceMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            logger.error(error.stack);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: SchemaInstanceUpdateModel)
        : Promise<SchemaInstanceResponseDto> => {
        try {
            const schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!schemaInstance) {
                ErrorHandler.throwNotFoundError('SchemaInstance not found!');
            }
            if (model.ContextParams != null) {
                schemaInstance.ContextParams = model.ContextParams;
            }
            if (model.ParentSchemaInstanceId != null) {
                schemaInstance.ParentSchemaInstanceId = model.ParentSchemaInstanceId;
            }
            var record = await this._schemaInstanceRepository.save(schemaInstance);
            return SchemaInstanceMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: uuid): Promise<boolean> => {
        try {
            var record = await this._schemaInstanceRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._schemaInstanceRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public updateAlmanac = async (schemaInstanceId: uuid, almanac: any): Promise<void> => {
        try {
            var schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : schemaInstanceId
                }
            });
            if (!schemaInstance) {
                ErrorHandler.throwNotFoundError('SchemaInstance not found!');
            }
            schemaInstance.AlmanacObjects = almanac;
            await this._schemaInstanceRepository.save(schemaInstance);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getAlmanac = async (schemaInstanceId: uuid): Promise<any> => {
        try {
            var schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : schemaInstanceId
                }
            });
            if (!schemaInstance) {
                ErrorHandler.throwNotFoundError('SchemaInstance not found!');
            }
            return schemaInstance.AlmanacObjects;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public setExecutionStarted = async (schemaInstanceId: uuid): Promise<void> => {
        try {
            var schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : schemaInstanceId
                }
            });
            if (!schemaInstance) {
                ErrorHandler.throwNotFoundError('SchemaInstance not found!');
            }
            schemaInstance.ExecutionStarted = true;
            schemaInstance.ExecutionStartedTimestamp = new Date();
            await this._schemaInstanceRepository.save(schemaInstance);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public updateContextParams = async (schemaInstanceId: uuid, params: Params): Promise<void> => {
        try {
            var schemaInstance = await this._schemaInstanceRepository.findOne({
                where : {
                    id : schemaInstanceId
                }
            });
            if (!schemaInstance) {
                ErrorHandler.throwNotFoundError('SchemaInstance not found!');
            }
            var tempParams = schemaInstance.ContextParams;
            if (tempParams == null) {
                tempParams = {
                    Name   : 'ContextParams',
                    Params : []
                };
            }
            var updatedExisting = false;
            for (let index = 0; index < tempParams.Params.length; index++) {
                const element = tempParams.Params[index];
                if (element.Key === params.Key) {
                    tempParams.Params[index].Value = params.Value;
                    updatedExisting = true;
                    break;
                }
            }
            if (!updatedExisting) {
                tempParams.Params.push(params);
            }
            schemaInstance.ContextParams = tempParams;
            await this._schemaInstanceRepository.save(schemaInstance);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getActivityHistory = async (schemaInstanceId: uuid): Promise<SchemaInstanceActivity[]> => {
        try {
            var activities = await this._schemaInstanceActivityRepository.find({
                where : {
                    SchemaInstanceId : schemaInstanceId
                },
                order : {
                    CreatedAt : 'ASC'
                }
            });
            return activities;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getActivitySummary = async (schemaInstanceId: uuid): Promise<any[]> => {
        try {
            var activities = await this._schemaInstanceActivityRepository.find({
                where : {
                    SchemaInstanceId : schemaInstanceId
                },
                order : {
                    CreatedAt : 'ASC'
                }
            });

            var summary = activities.map(x => {
                return {
                    Type    : x.Type,
                    Summary : x.Summary
                };
            });
            return summary;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public recordActivity = async (schemaInstanceId: uuid, type: WorkflowActivityType, payload: any, summary: any): Promise<void> => {
        try {
            var activity = this._schemaInstanceActivityRepository.create({
                Type             : type,
                SchemaInstanceId : schemaInstanceId,
                Payload          : payload,
                Summary          : summary,
            });
            await this._schemaInstanceActivityRepository.save(activity);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: SchemaInstanceSearchFilters) => {

        var search : FindManyOptions<SchemaInstance> = {
            relations : {
                Schema : {
                    Nodes : true,
                },
                CurrentNodeInstance : {
                    Node : true,
                },
                RootNodeInstance : {
                    Node : true,
                },
                NodeInstances : {
                    Node : true,
                },
            },
            where : {
            },
            select : {
                id     : true,
                Schema : {
                    id          : true,
                    Name        : true,
                    Description : true,
                    TenantId    : true,
                },
                RootNodeInstance : {
                    id   : true,
                    Node : {
                        id   : true,
                        Name : true,
                    },
                },
                CurrentNodeInstance : {
                    id   : true,
                    Node : {
                        id   : true,
                        Name : true,
                    },
                },
                NodeInstances : {
                    id   : true,
                    Node : {
                        id   : true,
                        Name : true,
                    },
                },
                CreatedAt : true,
                UpdatedAt : true,
            },
        };

        if (filters.SchemaId) {
            search.where['Schema'].id = filters.SchemaId;
        }
        if (filters.TenantId) {
            search.where['TenantId'] = filters.TenantId;
        }
        if (filters.Code) {
            search.where['Code'] = Like(`%${filters.Code}%`);
        }
        if (filters.ParentSchemaInstanceId) {
            search.where['ParentSchemaInstanceId'] = filters.ParentSchemaInstanceId;
        }

        return search;
    };

    //#endregion

}
