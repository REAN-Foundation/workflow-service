import { ActionType, ExecutionStatus, NodeType, ParamType } from '../../domain.types/engine/engine.enums';
import { SchemaInstanceResponseDto } from '../../domain.types/engine/schema.instance.types';
import { EventResponseDto } from '../../domain.types/engine/event.types';
import { SchemaResponseDto } from '../../domain.types/engine/schema.domain.types';
import { NodeService } from "../../database/services/engine/node.service";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { NodeInstanceResponseDto } from '../../domain.types/engine/node.instance.types';
import { formatDateToYYMMDD } from './engine.utils';
import { NodeInstance } from '../../database/models/engine/node.instance.model';
import { logger } from '../../logger/logger';
import { NodeInstanceService } from '../../database/services/engine/node.instance.service';
import { NodeResponseDto } from '../../domain.types/engine/node.types';
import { CommonUtilsService } from '../../database/services/engine/common.utils.service';
import { ActionExecutioner } from './action.executioner';
import { Almanac } from './almanac';
import { NodeActionResult } from "../../domain.types/engine/node.action.types";

///////////////////////////////////////////////////////////////////////////////

export class SchemaEngine {

    _almanac: Almanac;

    _schema: SchemaResponseDto | null = null;

    _schemaInstance: SchemaInstanceResponseDto | null = null;

    _event: EventResponseDto | null = null;

    _nodeService: NodeService = new NodeService();

    _nodeInstanceService: NodeInstanceService = new NodeInstanceService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    _commonUtilsService: CommonUtilsService = new CommonUtilsService();

    constructor(schema: SchemaResponseDto, schemaInstance: SchemaInstanceResponseDto, event: EventResponseDto) {
        this._schema = schema;
        this._schemaInstance = schemaInstance;
        this._event = event;
        this._almanac = new Almanac(schemaInstance.id);
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

        var currentNode = await this._nodeService.getById(currentNodeInstance.Node.id);

        if (currentNodeInstance.ExecutionStatus !== ExecutionStatus.Executed) {
            const allExecuted = await this.executeNodeActions(currentNode, currentNodeInstance);
            if (allExecuted) {
                currentNodeInstance.ExecutionStatus = ExecutionStatus.Executed;
            }
            logger.info(`Node ${currentNode.Name} All actions executed: ${allExecuted}`);
        }

        var currentNodeInstance = await this.traverse(currentNode, currentNodeInstance);
        return currentNodeInstance;
    };

    private async createSchemaInstance(schema: SchemaResponseDto, event: EventResponseDto) {

        const padZero = (num: number, size: number) => String(num).padStart(size, '0');
        const pattern = formatDateToYYMMDD(new Date());
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
        return schemaInstance;
    }

    // eslint-disable-next-line max-len
    private async traverse(
        currentNode: NodeResponseDto,
        currentNodeInstance: NodeInstanceResponseDto
    ): Promise<NodeInstanceResponseDto> {

        if (!currentNode) {
            logger.error(`Error while executing workflow. Cannot find the node!`);
        }

        if (currentNode.Type === NodeType.QuestionNode) {
            return await this.traverseQuestionNode(currentNode, currentNodeInstance);
        }
        else if (currentNode.Type === NodeType.YesNoNode) {
            return await this.traverseYesNoNode(currentNode, currentNodeInstance);
        }
        else if (currentNode.Type === NodeType.ExecutionNode) {
            return await this.traverseExecutionNode(currentNode, currentNodeInstance);
        }

    }

    private async traverseQuestionNode(
        currentNode: NodeResponseDto,
        currentNodeInstance: NodeInstanceResponseDto
    ): Promise<NodeInstance> {
        return null;
    }

    private async traverseYesNoNode(
        currentNode: NodeResponseDto,
        currentNodeInstance: NodeInstanceResponseDto
    ): Promise<NodeInstance> {
        return null;
    }

    private async traverseExecutionNode(
        currentNode: NodeResponseDto,
        currentNodeInstance: NodeInstanceResponseDto
    ): Promise<NodeInstance> {
        return null;
    }

    private async executeNodeActions(
        currentNode: NodeResponseDto,
        currentNodeInstance: NodeInstanceResponseDto): Promise<boolean> {

        //Generate the action executioner
        const actionExecutioner = new ActionExecutioner(this._schema, this._schemaInstance, this._event, this._almanac);

        var actions = await this._commonUtilsService.getNodeActions(currentNode.id);
        if (actions.length === 0) {
            return true;
        }
        var actionInstances = await this._commonUtilsService.getNodeActionInstances(currentNodeInstance.id);
        if (actionInstances.length === 0) {
            actionInstances = await this._commonUtilsService.createNodeActionInstances(currentNodeInstance.id);
        }

        actionInstances = actionInstances.sort((a, b) => a.Sequence - b.Sequence);

        var results = new Map<string, NodeActionResult>();

        for (var actionInstance of actionInstances) {

            if (actionInstance.Executed !== true) {

                if (actionInstance.ActionType === ActionType.TriggerListeningNode) {
                    var result = await actionExecutioner.ExecuteTriggerListeningNodeAction(actionInstance);
                    results.set(actionInstance.id, result);
                }
                else if (actionInstance.ActionType === ActionType.SendMessage) {
                    var result = await actionExecutioner.executeSendMessageAction(actionInstance);
                    results.set(actionInstance.id, result);
                }
                else if (actionInstance.ActionType === ActionType.SendMultipleMessages) {
                    var result = await actionExecutioner.executeSendMultipleMessagesAction(actionInstance);
                    results.set(actionInstance.id, result);
                }
                else if (actionInstance.ActionType === ActionType.GetFromAlmanac) {
                    var result = await actionExecutioner.executeStoreToAlmanacAction(actionInstance);
                    results.set(actionInstance.id, result);
                }
                else if (actionInstance.ActionType === ActionType.StoreToAlmanac) {
                    var result = await actionExecutioner.executeGetFromAlmanacAction(actionInstance);
                    results.set(actionInstance.id, result);
                }
                else if (actionInstance.ActionType === ActionType.ExistsInAlmanac) {
                    var result = await actionExecutioner.executeExistsInAlmanacAction(actionInstance);
                    results.set(actionInstance.id, result);
                }
            }
        }

        var keys = Array.from(results.keys());
        var allExecuted = keys.every(k => results.get(k).Success === true);
        if (allExecuted) {
            await this._nodeInstanceService.setExecutionStatus(currentNodeInstance.id, ExecutionStatus.Executed);
        }
        return allExecuted;
    }

}
