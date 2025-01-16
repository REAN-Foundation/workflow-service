import { Node } from '../../models/engine/node.model';
import { Schema } from '../../models/engine/schema.model';
import { Rule } from '../../models/engine/rule.model';
import { Client } from '../../../database/models/client/client.model';
import { NodeAction } from '../../models/engine/node.action.model';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../database.connector';
import { Repository, Not } from 'typeorm';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { NodeActionCreateModel, NodeActionResponseDto } from '../../../domain.types/engine/node.action.types';
import { SchemaInstance } from '../../../database/models/engine/schema.instance.model';
import { NodeActionInstance } from '../../../database/models/engine/node.action.instance.model';
import { NodeInstance } from '../../../database/models/engine/node.instance.model';
import { NodeInstanceMapper } from '../../../database/mappers/engine/node.instance.mapper';
import { logger } from '../../../logger/logger';
import { NodeActionInstanceResponseDto } from '../../../domain.types/engine/node.instance.types';
import { NodeActionMapper } from '../../../database/mappers/engine/node.action.mapper';
import { ExecutionStatus } from '../../../domain.types/engine/engine.enums';
import { NodeType } from '../../../domain.types/engine/engine.enums';
import { Question } from '../../../database/models/engine/question.model';
import { QuestionNodeResponseDto } from '../../../domain.types/engine/node.types';
import { NodeMapper } from '../../../database/mappers/engine/node.mapper';
import { QuestionOption } from '../../../database/models/engine/question.option.model';
import { QuestionAnswerOption } from '../../../domain.types/engine/user.event.types';
import { NodePathResponseDto } from '../../../domain.types/engine/node.path.types';
import { NodePath } from '../../../database/models/engine/node.path.model';
import { NodePathMapper } from '../../../database/mappers/engine/node.path.mapper';

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

    _questionRepository: Repository<Question> = Source.getRepository(Question);

    _questionOptionRepository: Repository<QuestionOption> = Source.getRepository(QuestionOption);

    _nodePathRepository: Repository<NodePath> = Source.getRepository(NodePath);

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

    public createAction = async (actionModel: NodeActionCreateModel, parentNode?: Node): Promise<NodeAction> => {

        if (!parentNode) {
            parentNode = await this.getNode(actionModel.ParentNodeId);
        }

        const action = this._actionRepository.create({
            ParentNode   : parentNode,
            Sequence     : actionModel.Sequence,
            IsPathAction : actionModel.IsPathAction,
            Type         : actionModel.Type,
            Name         : actionModel.Name,
            Description  : actionModel.Description,
            Input        : actionModel.Input,
            Output       : actionModel.Output,
        });
        var record = await this._actionRepository.save(action);
        return record;
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

    public getNodeActions = async (nodeId: uuid, isPathAction = false): Promise<NodeActionResponseDto[]> => {
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
                    IsPathAction : isPathAction,
                    ParentNode   : {
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

    public getOrCreateNodeActionInstances = async (nodeInstanceId: uuid, isPathAction = false): Promise<NodeActionInstanceResponseDto[]> => {
        try {
            var nodeInstance = await this._nodeInstanceRepository.findOne({
                where : {
                    id : nodeInstanceId
                },
                relations : {
                    Node           : true,
                    SchemaInstance : true
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
            var nodeActionRecords = await this._actionRepository.find({
                where : {
                    IsPathAction : isPathAction,
                    ParentNode   : {
                        id : nodeInstance.Node.id
                    }
                }
            });
            var actions = nodeActionRecords.map(x => NodeActionMapper.toResponseDto(x));

            var actionInstances: NodeActionInstanceResponseDto[] = [];
            for (var action of actions) {
                var actionInstance = await this._nodeActionInstanceRepository.findOne({
                    where : {
                        NodeInstanceId : nodeInstanceId,
                        ActionId       : action.id
                    }
                });
                if (!actionInstance) {
                    var instance = await this._nodeActionInstanceRepository.create({
                        ActionType       : action.Type,
                        Sequence         : action.Sequence,
                        ActionId         : action.id,
                        NodeId           : nodeInstance.Node.id,
                        NodeInstanceId   : nodeInstanceId,
                        SchemaInstanceId : nodeInstance.SchemaInstance.id,
                        Executed         : false,
                        Input            : action.Input,
                        Output           : action.Output,
                    });
                    actionInstance = await this._nodeActionInstanceRepository.save(instance);
                }
                actionInstances.push(NodeInstanceMapper.toNodeActionInstanceResponseDto(actionInstance, action));
            }

            return actionInstances;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public markActionInstanceAsExecuted = async (actionInstanceId: uuid): Promise<NodeActionInstanceResponseDto> => {
        try {
            var actionInstance = await this._nodeActionInstanceRepository.findOne({
                where : {
                    id : actionInstanceId
                }
            });
            if (!actionInstance) {
                ErrorHandler.throwNotFoundError('ActionInstance not found');
            }
            actionInstance.Executed = true;
            actionInstance.ExecutionTimestamp = new Date();
            var updatedActionInstance = await this._nodeActionInstanceRepository.save(actionInstance);
            return NodeInstanceMapper.toNodeActionInstanceResponseDto(updatedActionInstance);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getOrCreateNodeActionInstance = async (actionId: uuid, nodeInstanceId:uuid)
        : Promise<NodeActionInstanceResponseDto> => {
        try {
            var actionInstance = await this._nodeActionInstanceRepository.findOne({
                where : {
                    ActionId       : actionId,
                    NodeInstanceId : nodeInstanceId
                }
            });
            if (actionInstance) {
                var action = await this._actionRepository.findOne({
                    where : {
                        id : actionId
                    },
                    relations : {
                        ParentNode : true
                    }
                });
                return NodeInstanceMapper.toNodeActionInstanceResponseDto(actionInstance, action);
            }
            return await this.createNodeActionInstance(nodeInstanceId, actionId);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getActiveListeningNodeInstances = async (schemaInstanceId: uuid) => {
        try {
            var nodeInstances = await this._nodeInstanceRepository.find({
                where : {
                    Type           : NodeType.ListeningNode,
                    SchemaInstance : {
                        id : schemaInstanceId
                    },
                    ExecutionStatus : Not(ExecutionStatus.Executed)
                },
                relations : {
                    Node           : true,
                    SchemaInstance : true,
                }
            });
            var dtos = nodeInstances.map(x => NodeInstanceMapper.toResponseDto(x));
            return dtos;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getQuestionNode = async (questionId: uuid): Promise<QuestionNodeResponseDto> => {
        try {
            var question = await this._questionRepository.findOne({
                where : {
                    id : questionId
                },
                relations : {
                    Options : true,
                }
            });
            if (!question) {
                ErrorHandler.throwNotFoundError('Question not found');
            }
            var node = await this._nodeRepository.findOne({
                where : {
                    id : questionId
                },
                relations : {
                    Paths   : true,
                    Actions : true,
                }
            });
            if (!node) {
                ErrorHandler.throwNotFoundError('Node not found');
            }
            return NodeMapper.toResponseDto(node, node.Actions, question);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getQuestionOptions = async (questionId: uuid): Promise<QuestionAnswerOption[]> => {
        try {
            var options = await this._questionOptionRepository.find({
                where : {
                    Question : {
                        id : questionId
                    }
                }
            });
            return options.map(x => {
                return {
                    id       : x.id,
                    Text     : x.Text,
                    ImageUrl : x.ImageUrl,
                    Sequence : x.Sequence,
                    Metadata : x.Metadata
                };
            });
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getQuestion = async (questionId: uuid): Promise<Question> => {
        try {
            var question = await this._questionRepository.findOne({
                where : {
                    id : questionId
                },
                relations : {
                    Options : true,
                }
            });
            if (!question) {
                ErrorHandler.throwNotFoundError('Question not found');
            }
            return question;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getNodePaths = async (nodeId: uuid): Promise<NodePathResponseDto[]> => {
        try {
            var nodePaths = await this._nodePathRepository.find({
                where : {
                    ParentNode : {
                        id : nodeId
                    }
                },
                relations : {
                    ParentNode : true,
                    NextNode   : true,
                    Rule       : true,
                }
            });
            if (!nodePaths) {
                ErrorHandler.throwNotFoundError('Node path not found');
            }
            return nodePaths.map(x => NodePathMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private createNodeActionInstance = async (nodeInstanceId: uuid, actionId: uuid): Promise<NodeActionInstanceResponseDto> => {
        try {
            var nodeInstance = await this._nodeInstanceRepository.findOne({
                where : {
                    id : nodeInstanceId
                },
                relations : {
                    Node           : true,
                    SchemaInstance : true
                }
            });
            if (!nodeInstance) {
                ErrorHandler.throwNotFoundError('NodeInstance not found');
            }
            var action = await this._actionRepository.findOne({
                where : {
                    id : actionId
                },
                relations : {
                    ParentNode : true
                }
            });
            if (!action) {
                ErrorHandler.throwNotFoundError('Action not found');
            }
            var existing = await this._nodeActionInstanceRepository.findOne({
                where : {
                    NodeInstanceId : nodeInstanceId,
                    ActionId       : actionId
                }
            });
            if (existing) {
                return NodeInstanceMapper.toNodeActionInstanceResponseDto(existing);
            }
            var actionInstance = await this._nodeActionInstanceRepository.create({
                ActionType       : action.Type,
                Sequence         : action.Sequence,
                ActionId         : action.id,
                NodeId           : nodeInstance.Node.id,
                NodeInstanceId   : nodeInstanceId,
                SchemaInstanceId : nodeInstance.SchemaInstance.id,
                Executed         : false,
                Input            : action.Input,
                Output           : action.Output,
            });
            var nodeActionInstance = await this._nodeActionInstanceRepository.save(actionInstance);
            return NodeInstanceMapper.toNodeActionInstanceResponseDto(nodeActionInstance, action);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#endregion

}
