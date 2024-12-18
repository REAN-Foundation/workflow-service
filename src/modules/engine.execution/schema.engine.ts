import { ActionType, ExecutionStatus, InputSourceType, NodeType, ParamType, WorkflowActivityType } from '../../domain.types/engine/engine.enums';
import { SchemaInstanceResponseDto } from '../../domain.types/engine/schema.instance.types';
import { EventResponseDto } from '../../domain.types/engine/event.types';
import { SchemaResponseDto } from '../../domain.types/engine/schema.domain.types';
import { NodeService } from "../../database/services/engine/node.service";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { NodeActionInstanceResponseDto, NodeInstanceResponseDto } from '../../domain.types/engine/node.instance.types';
import { logger } from '../../logger/logger';
import { NodeInstanceService } from '../../database/services/engine/node.instance.service';
import { ConditionService } from '../../database/services/engine/condition.service';
import { NodeResponseDto } from '../../domain.types/engine/node.types';
import { CommonUtilsService } from '../../database/services/engine/common.utils.service';
import { ActionExecutioner } from './action.executioner';
import { Almanac } from './almanac';
import { NodeActionResult } from "../../domain.types/engine/node.action.types";
import { RuleService } from '../../database/services/engine/rule.service';
import { ConditionProcessor } from './condition.processor';
import { NodeActionService } from '../../database/services/engine/node.action.service';
import { TimeUtils } from '../../common/utilities/time.utils';
import { EngineUtils } from './engine.utils';

///////////////////////////////////////////////////////////////////////////////

export class SchemaEngine {

    _almanac: Almanac;

    _schema: SchemaResponseDto | null = null;

    _schemaInstance: SchemaInstanceResponseDto | null = null;

    _event: EventResponseDto | null = null;

    _nodeService: NodeService = new NodeService();

    _ruleService: RuleService = new RuleService();

    _nodeInstanceService: NodeInstanceService = new NodeInstanceService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    _actionService: NodeActionService = new NodeActionService();

    _conditionService: ConditionService = new ConditionService();

    _commonUtilsService: CommonUtilsService = new CommonUtilsService();

    _engineUtils: EngineUtils = new EngineUtils();

    constructor(schema: SchemaResponseDto, schemaInstance: SchemaInstanceResponseDto, event: EventResponseDto) {
        this._schema = schema;
        this._schemaInstance = schemaInstance;
        this._event = event;
        if (schemaInstance) {
            this._almanac = new Almanac(schemaInstance.id);
        }
    }

    public execute = async () => {

        // If found,
        //    - Get the correct executing node, active listening nodes, triggered waiting nodes
        // else,
        //    a. Create a new schema instance
        //    b. Set current node as root node
        //    c. Start node execution
        //    d. Initiate the listening nodes - Add this as an action from root node

        var currentNodeInstance: NodeInstanceResponseDto = null;
        if (!this._schemaInstance) {
            this._schemaInstance = await this.createSchemaInstance(this._schema, this._event);
            currentNodeInstance = await this._nodeInstanceService.getById(this._schemaInstance.RootNodeInstance.id);
        }
        else {
            currentNodeInstance = await this._nodeInstanceService.getById(this._schemaInstance.CurrentNodeInstance.id);
        }

        await this._schemaInstanceService.recordActivity(this._schemaInstance.id, WorkflowActivityType.UserEvent, this._event);

        //Set up the almanac
        this._almanac = new Almanac(this._schemaInstance.id);

        //Sync the almanac with the schema instance
        await this.syncWithAlmanac(this._schemaInstance);

        //If there are any listening nodes, handle them
        await this.handleListeningNodes();

        currentNodeInstance = await this.processCurrentNode(currentNodeInstance);

        return currentNodeInstance;
    };

    //#region Private methods

    private async processCurrentNode(currentNodeInstance: NodeInstanceResponseDto) {

        if (currentNodeInstance.ExecutionStatus !== ExecutionStatus.Executed) {
            const allExecuted = await this.executeNodeActions(currentNodeInstance);
            if (allExecuted) {
                currentNodeInstance.ExecutionStatus = ExecutionStatus.Executed;
            }
        }

        var newNodeInstance = await this.traverse(currentNodeInstance);
        if (!newNodeInstance) {
            logger.error(`Error while executing workflow. Cannot find the node!`);
        }

        if (newNodeInstance.id !== currentNodeInstance.id) {
            currentNodeInstance = newNodeInstance;
            if (currentNodeInstance.Node.Type === NodeType.ExecutionNode) {
                return await this.processCurrentNode(currentNodeInstance);
            }
        }
        return currentNodeInstance;
    }

    private async handleListeningNodes() {

        var listeningNodeInstances = await this._commonUtilsService.getActiveListeningNodeInstances(this._schemaInstance.id);

        for (var listeningNodeInstance of listeningNodeInstances) {
            var listeningNode = await this._nodeService.getById(listeningNodeInstance.Node.id);
            var input = listeningNode.Input;
            var par = input.Params.length > 0 ? input.Params[0] : null;
            if (!par) {
                logger.error(`Error while executing workflow. Cannot find the input params!`);
                continue;
            }
            var expectedType = par.Type;
            var expectedSource = par.Source;
            var inputsFulfilled = false;
            var inputValue = null;
            if (expectedSource === InputSourceType.UserEvent) {
                if (expectedType === ParamType.Location) {
                    if (this._event.UserMessage.Location) {
                        inputValue = this._event.UserMessage.Location;
                        inputsFulfilled = true;
                    }
                }
            }
            if (!inputsFulfilled) {
                logger.error(`Error while executing workflow. Required inputs not fulfilled!`);
                continue;
            }
            //Execute the actions
            var actionExecutioner = new ActionExecutioner(this._schema, this._schemaInstance, this._event, this._almanac);
            var actionInstances = await this._commonUtilsService.getOrCreateNodeActionInstances(listeningNodeInstance.id);
            var results = new Map<string, NodeActionResult>();
            for (var actionInstance of actionInstances) {
                if (actionInstance.Executed !== true) {
                    var params = actionInstance.Input?.Params;
                    if (params && params.length === 0) {
                        continue;
                    }
                    for (var p of actionInstance.Input.Params) {
                        if (p.Type === expectedType && p.Source === expectedSource) {
                            p.Value = inputValue;
                        }
                    }
                    var result: NodeActionResult = await this.executeAction(actionInstance, actionExecutioner);
                    results.set(actionInstance.id, result);
                }
            }

            var keys = Array.from(results.keys());
            var allExecuted = keys.every(k => results.get(k).Success === true);
            if (allExecuted) {
                await this._nodeInstanceService.setExecutionStatus(listeningNodeInstance.id, ExecutionStatus.Executed);
            }
            return allExecuted;
        }
    }

    private async syncWithAlmanac(schemaInstance: SchemaInstanceResponseDto) {
        var fact: any = null;
        const params = schemaInstance.ContextParams.Params;
        for await (var p of params) {
            if (p.Type === ParamType.Phonenumber && p.Value) {
                fact = await this._almanac.getFact(p.Key);
                if (!fact) {
                    await this._almanac.addFact(p.Key, p.Value);
                }
            }
            if (p.Type === ParamType.Location && p.Value) {
                fact = await this._almanac.getFact(p.Key);
                if (!fact) {
                    await this._almanac.addFact(p.Key, p.Value);
                }
            }
            if (p.Type === ParamType.DateTime && p.Value) {
                fact = await this._almanac.getFact(p.Key);
                if (!fact) {
                    await this._almanac.addFact(p.Key, p.Value);
                }
            }
            if (p.Type === ParamType.Text && p.Value) {
                if (p.Key === 'SchemaInstanceCode') {
                    fact = await this._almanac.getFact(p.Key);
                    if (!fact) {
                        await this._almanac.addFact(p.Key, p.Value);
                    }
                }
            }
        }
    }

    private async traverse(currentNodeInstance: NodeInstanceResponseDto
    ): Promise<NodeInstanceResponseDto> {

        var currentNodeType = currentNodeInstance.Node.Type;

        if (currentNodeType === NodeType.QuestionNode) {
            return await this.traverseQuestionNode(currentNodeInstance);
        }
        else if (currentNodeType === NodeType.YesNoNode) {
            return await this.traverseYesNoNode(currentNodeInstance);
        }
        else if (currentNodeType === NodeType.ExecutionNode) {
            return await this.traverseExecutionNode(currentNodeInstance);
        }
        return currentNodeInstance;
    }

    private async traverseQuestionNode(currentNodeInstance: NodeInstanceResponseDto)
        : Promise<NodeInstanceResponseDto> {
        // TODO: Implement the question node traversal logic
        return currentNodeInstance;
    }

    private async traverseYesNoNode(currentNodeInstance: NodeInstanceResponseDto)
        : Promise<NodeInstanceResponseDto> {

        var currentNode = await this._nodeService.getById(currentNodeInstance.Node.id);
        var yesActionId = await currentNode.YesAction?.id;
        var noActionId = await currentNode.NoAction?.id;

        var yesAction = await this._actionService.getById(yesActionId);
        var noAction = await this._actionService.getById(noActionId);

        var yesActionInstance = await this._commonUtilsService.getOrCreateNodeActionInstance(yesAction.id, currentNodeInstance.id);
        var noActionInstance = await this._commonUtilsService.getOrCreateNodeActionInstance(noAction.id, currentNodeInstance.id);

        var ruleId = currentNode.RuleId;
        var rule = await this._ruleService.getById(ruleId);
        if (!rule) {
            logger.error(`Rule not found for Node ${currentNode.Name}`);
            return null;
        }

        const actionExecutioner = new ActionExecutioner(this._schema, this._schemaInstance, this._event, this._almanac);
        var condition = rule.Condition;
        if (!condition) {
            condition = await this._conditionService.getById(rule.ConditionId);
        }
        var processor = new ConditionProcessor(this._almanac);
        var conditionResult = await processor.processCondition(condition, null);
        logger.info(`Yes/No Node ${currentNode.Name} Condition Result: ${conditionResult}`);
        var result: NodeActionResult = {
            Success : false,
            Result  : null,
        };
        const actionToExecute = conditionResult ? yesActionInstance : noActionInstance;

        if (actionToExecute.ActionType === ActionType.Continue) {
            var res = await this.setNextNodeInstance(currentNode, currentNodeInstance);
            if (!res || !res.currentNode || !res.currentNodeInstance) {
                logger.error(`Error while setting next node instance!`);
                return currentNodeInstance;
            }
            return res.currentNodeInstance;
        }
        else {
            result = await this.executeAction(actionToExecute, actionExecutioner);
            logger.info(`Yes/No Node Action Result: ${JSON.stringify(result)}`);
        }
        return currentNodeInstance;
    }

    private async traverseExecutionNode(currentNodeInstance: NodeInstanceResponseDto)
        : Promise<NodeInstanceResponseDto> {

        if (currentNodeInstance.ExecutionStatus === ExecutionStatus.Executed) {
            var currentNode = await this._nodeService.getById(currentNodeInstance.Node.id);
            var res = await this.setNextNodeInstance(currentNode, currentNodeInstance);
            if (!res || !res.currentNode || !res.currentNodeInstance) {
                logger.error(`Error while setting next node instance!`);
                return currentNodeInstance;
            }
            return res.currentNodeInstance;
        }
        return currentNodeInstance;
    }

    private async executeNodeActions(currentNodeInstance: NodeInstanceResponseDto):
        Promise<boolean> {

        //Generate the action executioner
        const actionExecutioner = new ActionExecutioner(this._schema, this._schemaInstance, this._event, this._almanac);

        const includePathActions = false;
        const currentNodeId = currentNodeInstance.Node.id;
        var actions = await this._commonUtilsService.getNodeActions(currentNodeId, includePathActions);
        if (actions.length === 0) {
            return true;
        }
        var actionInstances = await this._commonUtilsService.getOrCreateNodeActionInstances(currentNodeInstance.id, includePathActions);
        actionInstances = actionInstances.sort((a, b) => a.Sequence - b.Sequence);

        var results = new Map<string, NodeActionResult>();

        for (var actionInstance of actionInstances) {
            if (actionInstance.Executed !== true) {
                var result: NodeActionResult = await this.executeAction(actionInstance, actionExecutioner);
                results.set(actionInstance.id, result);
            }
        }

        var keys = Array.from(results.keys());
        var allExecuted = keys.every(k => results.get(k).Success === true);
        if (allExecuted) {
            await this._nodeInstanceService.setExecutionStatus(currentNodeInstance.id, ExecutionStatus.Executed);
        }
        return allExecuted;
    }

    private async executeAction(actionInstance: NodeActionInstanceResponseDto, actionExecutioner: ActionExecutioner) {
        var result: NodeActionResult = {
            Success : false,
            Result  : null,
        };

        if (actionInstance.ActionType === ActionType.TriggerListeningNode) {
            result = await actionExecutioner.ExecuteTriggerListeningNodeAction(actionInstance);
        }
        else if (actionInstance.ActionType === ActionType.SendMessage) {
            result = await actionExecutioner.executeSendMessageAction(actionInstance);
        }
        else if (actionInstance.ActionType === ActionType.SendMultipleMessages) {
            result = await actionExecutioner.executeSendMultipleMessagesAction(actionInstance);
        }
        else if (actionInstance.ActionType === ActionType.GetFromAlmanac) {
            result = await actionExecutioner.executeGetFromAlmanacAction(actionInstance);
        }
        else if (actionInstance.ActionType === ActionType.StoreToAlmanac) {
            result = await actionExecutioner.executeStoreToAlmanacAction(actionInstance);
        }
        else if (actionInstance.ActionType === ActionType.ExistsInAlmanac) {
            result = await actionExecutioner.executeExistsInAlmanacAction(actionInstance);
        }
        else if (actionInstance.ActionType === ActionType.UpdateContextParams) {
            result = await actionExecutioner.executeUpdateContextParamsAction(actionInstance);
        }
        else if (actionInstance.ActionType === ActionType.Continue) {
            return {
                Success : true,
                Result  : true,
            };
        }
        else if (actionInstance.ActionType === ActionType.RestApiCall) {
            result = await actionExecutioner.executeRestApiCallAction(actionInstance);
        }
        return result;
    }

    private async setNextNodeInstance(currentNode: NodeResponseDto, currentNodeInstance: NodeInstanceResponseDto) {
        var nextNodeId = currentNode.NextNodeId;
        var schemaInstanceId = currentNodeInstance.SchemaInstance.id;
        var [nextNodeInstance, nextNode] = await this._engineUtils.createNodeInstance(nextNodeId, schemaInstanceId);
        if (!nextNodeInstance || !nextNode) {
            logger.error(`Error while setting next node instance!`);
            return { currentNode, currentNodeInstance };
        }

        // Record the activity
        const activityPayload = {
            PreviousNodeInstance : currentNodeInstance,
            PreviousNode         : currentNode,
            NextNodeInstance     : nextNodeInstance,
            NextNode             : nextNode,
        };
        await this._schemaInstanceService.recordActivity(schemaInstanceId, WorkflowActivityType.SwitchCurrentNode, activityPayload);

        currentNodeInstance = nextNodeInstance;
        currentNode = nextNode;
        await this._schemaInstanceService.setCurrentNodeInstance(this._schemaInstance.id, currentNodeInstance.id);
        return { currentNode, currentNodeInstance };
    }

    private async createSchemaInstance(schema: SchemaResponseDto, event: EventResponseDto) {

        const padZero = (num: number, size: number) => String(num).padStart(size, '0');
        const pattern = TimeUtils.formatDateToYYMMDD(new Date());
        var instanceCount = await this._schemaInstanceService.getCount(schema.TenantId, schema.id, pattern);
        const formattedCount = padZero(instanceCount + 1, 3); // Count with leading zeros (e.g., 001)
        var code = 'E-' + pattern + '-' + formattedCount;

        var schemaInstanceContextParams = schema.ContextParams;
        for (var p of schemaInstanceContextParams.Params) {
            if (p.Type === ParamType.Phonenumber) {
                p.Value = event.UserMessage.Phone;
            }
            if (p.Type === ParamType.Location) {
                p.Value = event.UserMessage.Location;
            }
            if (p.Type === ParamType.DateTime) {
                p.Value = new Date();
            }
            if (p.Type === ParamType.Text) {
                if (p.Key === 'SchemaInstanceCode') {
                    p.Value = code;
                }
            }
        }
        const schemaInstance = await this._schemaInstanceService.create({
            TenantId      : schema.TenantId,
            Code          : code,
            SchemaId      : schema.id,
            ContextParams : schemaInstanceContextParams,
        });

        if (!schemaInstance) {
            logger.error(`Error while creating schema instance!`);
            return null;
        }

        return schemaInstance;
    }

    //#endregion

}
