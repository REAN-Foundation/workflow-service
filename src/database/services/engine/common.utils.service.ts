import { Node } from '../../models/engine/node.model';
import { Schema } from '../../models/engine/schema.model';
import { Rule } from '../../models/engine/rule.model';
import { Client } from '../../../database/models/client/client.model';
import { NodeAction } from '../../models/engine/node.action.model';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../database.connector';
import { Repository } from 'typeorm';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { NodeActionCreateModel, NodeActionResponseDto } from '../../../domain.types/engine/node.action.types';
import { SchemaInstance } from '../../../database/models/engine/schema.instance.model';
import { NodeActionInstance } from '../../../database/models/engine/node.action.instance.model';
import { NodeInstance } from '../../../database/models/engine/node.instance.model';
import { NodeInstanceMapper } from '../../../database/mappers/engine/node.instance.mapper';
import { logger } from '../../../logger/logger';
import { NodeActionInstanceResponseDto } from '../../../domain.types/engine/node.instance.types';
import { NodeActionMapper } from '../../../database/mappers/engine/node.action.mapper';

///////////////////////////////////////////////////////////////////////

export class CommonUtilsService {

    //#region Repositories

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _schemaRepository: Repository<Schema> = Source.getRepository(Schema);

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    _actionRepository: Repository<NodeAction> = Source.getRepository(NodeAction);

    _clientRepository: Repository<Client> = Source.getRepository(Client);

    _nodeInstanceRepository: Repository<NodeInstance> = Source.getRepository(NodeInstance);

    _nodeActionInstanceRepository: Repository<NodeActionInstance> = Source.getRepository(NodeActionInstance);

    _schemaInstanceRepository: Repository<SchemaInstance> = Source.getRepository(SchemaInstance);

    //#endregion

    public getSchema = async (schemaId: uuid) => {
        const schema = await this._schemaRepository.findOne({
            where : {
                id : schemaId as string
            },
            relations : {
                Nodes : true,
            }
        });
        if (!schema) {
            ErrorHandler.throwNotFoundError('Schema cannot be found');
        }
        return schema;
    };

    public createAction = async (actionModel: NodeActionCreateModel) => {
        const action = await this._actionRepository.create({
            Type        : actionModel.Type,
            Name        : actionModel.Name,
            Description : actionModel.Description,
            Input       : actionModel.Input,
            Output      : actionModel.Output
        });
        return action;
    };

    public getNode = async (nodeId: uuid) => {
        return await this._nodeRepository.findOne({
            where : {
                id : nodeId
            },
            relations : {
                Actions    : true,
                Children   : true,
                ParentNode : true,
                Paths      : true,
                Schema     : true,
            }
        });
    };

    public getClient = async (clientId: uuid) => {
        const client = await this._clientRepository.findOne({
            where : {
                id : clientId
            }
        });
        if (!client) {
            ErrorHandler.throwNotFoundError('Client cannot be found');
        }
        return client;
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

    public createNodeActionInstances = async (nodeInstanceId: uuid): Promise<NodeActionInstanceResponseDto[]> => {
        try {
            var nodeInstance = await this._nodeInstanceRepository.findOne({
                where : {
                    id : nodeInstanceId
                }
            });
            if (!nodeInstance) {
                ErrorHandler.throwNotFoundError('NodeInstance not found');
            }
            var node = await this._nodeRepository.findOne({
                where : {
                    id : nodeInstance.Node.id
                }
            });
            if (!node) {
                ErrorHandler.throwNotFoundError('Node not found');
            }

            var actionInstances: NodeActionInstanceResponseDto[] = [];
            for await (var action of node.Actions) {
                const actionInstance = await this._nodeActionInstanceRepository.create({
                    ActionType       : action.Type,
                    Sequence         : action.Sequence,
                    ActionId         : action.id,
                    NodeId           : node.id,
                    NodeInstanceId   : nodeInstance.id,
                    SchemaInstanceId : nodeInstance.SchemaInstance.id,
                    Executed         : false,
                    Input            : action.Input,
                    Output           : action.Output,
                });
                var nodeActionInstance = await this._nodeActionInstanceRepository.save(actionInstance);
                actionInstances.push(NodeInstanceMapper.toNodeActionInstanceResponseDto(nodeActionInstance));
            }
            return actionInstances;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getNodeActionInstances = async (nodeInstanceId: uuid): Promise<NodeActionInstanceResponseDto[]> => {
        try {
            var instances = await this._nodeActionInstanceRepository.find({
                where : {
                    NodeInstanceId : nodeInstanceId
                }
            });
            if (!instances) {
                ErrorHandler.throwNotFoundError('NodeInstance not found');
            }
            return instances.map(x => NodeInstanceMapper.toNodeActionInstanceResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

}
