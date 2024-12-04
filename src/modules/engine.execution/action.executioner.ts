import { ExecutionStatus, InputSourceType, ParamType } from "../../domain.types/engine/engine.enums";
import { ActionInputParams, ActionOutputParams } from "../../domain.types/engine/intermediate.types/params.types";
import { logger } from "../../logger/logger";
import { Almanac } from "./almanac";
import { ChatbotMessageService } from "../communication/chatbot.message.service";
import { NodeActionInstanceResponseDto } from "../../domain.types/engine/node.instance.types";
import { NodeService } from "../../database/services/engine/node.service";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { NodeInstanceService } from '../../database/services/engine/node.instance.service';
import { CommonUtilsService } from '../../database/services/engine/common.utils.service';
import { SchemaResponseDto } from "../../domain.types/engine/schema.domain.types";
import { SchemaInstanceResponseDto } from "../../domain.types/engine/schema.instance.types";
import { EventResponseDto } from "../../domain.types/engine/event.types";
import { NodeActionResult } from "../../domain.types/engine/node.action.types";
import needle = require('needle');

////////////////////////////////////////////////////////////////

export class ActionExecutioner {

    _almanac: Almanac;

    _schema: SchemaResponseDto | null = null;

    _schemaInstance: SchemaInstanceResponseDto | null = null;

    _event: EventResponseDto | null = null;

    _nodeService: NodeService = new NodeService();

    _nodeInstanceService: NodeInstanceService = new NodeInstanceService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    _commonUtilsService: CommonUtilsService = new CommonUtilsService();

    constructor(schema: SchemaResponseDto,
        schemaInstance: SchemaInstanceResponseDto,
        event: EventResponseDto,
        almanac: Almanac) {
        this._schema = schema;
        this._schemaInstance = schemaInstance;
        this._event = event;
        this._almanac = almanac;
    }

    public ExecuteTriggerListeningNodeAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var nodeId = await this.getActionParamValue(input, ParamType.NodeId, 'NodeId');
        if (!nodeId) {
            logger.error('NodeId not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        // Execute the action
        var node = await this._nodeService.getById(nodeId);
        if (!node) {
            logger.error(`Node not found for id: ${nodeId}`);
            return {
                Success : false,
                Result  : null
            };
        }

        var nodeInstance = await this._nodeInstanceService.getByNodeIdAndSchemaInstance(nodeId, this._schemaInstance.id);
        if (!nodeInstance) {
            nodeInstance = await this._nodeInstanceService.create({
                Type             : node.Type,
                Input            : node.Input,
                NodeId           : nodeId,
                SchemaInstanceId : this._schemaInstance.id,
                ExecutionStatus  : ExecutionStatus.Pending
            });
        }
        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        return {
            Success : true,
            Result  : nodeInstance
        };
    };

    public executeSendMessageAction  = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var phonenumber = await this.getActionParamValue(input, ParamType.Phonenumber, 'Phonenumber');
        if (!phonenumber) {
            logger.error(`Phonenumber not found in almanac`);
            return {
                Success : false,
                Result  : null
            };
        }
        var message = await this.getActionParamValue(input, ParamType.Text, 'Message');
        if (!message) {
            logger.error('Message not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }
        // var messagePlaceholders = input.Params.filter(x => x.Type === ParamType.Placeholder);
        // messagePlaceholders.forEach(async (placeholder) => {
        //     var placeholderKey = placeholder.Key;
        //     var placeholderValue = placeholder.Value;
        //     if (placeholderKey && placeholderValue) {
        //         message = message.replace(placeholderKey, placeholderValue);
        //     }
        // });

        // Execute the action
        var messageService = new ChatbotMessageService();
        var result = await messageService.send(phonenumber, message);
        if (result === true) {
            await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        }
        return {
            Success : result === true,
            Result  : result
        };
    };

    public executeSendMultipleMessagesAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        const p = input.Params.find(x => x.Type === ParamType.Array);
        if (!p) {
            logger.error('Input parameters not found');
            return {
                Success : false,
                Result  : null
            };
        }
        var values = null;
        if (!p.Value) {
            const source = p.Source || InputSourceType.Almanac;
            if (source === InputSourceType.Almanac) {
                values = await this._almanac.getFact(p.Key);
            }
        }
        else {
            values = p.Value;
        }

        var phonenumebrs: string[] = [];
        if (values && values.length > 0) {
            phonenumebrs = values.map(x => x["Phonenumber"]);
        }

        var message = await this.getActionParamValue(input, ParamType.Text, 'MessageText');
        var location = await this.getActionParamValue(input, ParamType.Location, 'Location');
        if (!message && !location) {
            logger.error('Text message or location not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        // Execute the action
        var messageService = new ChatbotMessageService();
        for (let index = 0; index < phonenumebrs.length; index++) {
            const phonenumber = phonenumebrs[index];
            var result = await messageService.send(phonenumber, message);
            if (!result) {
                return {
                    Success : false,
                    Result  : null
                };
            }
        }
        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        return {
            Success : true,
            Result  : result
        };
    };

    public executeStoreToAlmanacAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var p = input.Params && input.Params.length > 0 ? input.Params[0] : null;
        if (!p) {
            logger.error('Input parameters not found');
            return {
                Success : false,
                Result  : null
            };
        }
        var key = p.Key;
        if (!key) {
            logger.error('Key not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }
        var value = p.Value;
        if (!value) {
            logger.error('Value not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        // Execute the action
        await this._almanac.addFact(key, value);

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);

        return {
            Success : true,
            Result  : true
        };
    };

    public executeGetFromAlmanacAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var p = input.Params && input.Params.length > 0 ? input.Params[0] : null;
        if (!p) {
            logger.error('Input parameters not found');
            return {
                Success : false,
                Result  : null
            };
        }
        var key = p.Key;
        if (!key) {
            logger.error('Key not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        // Execute the action
        var result = await this._almanac.getFact(key);

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);

        return {
            Success : true,
            Result  : result
        };
    };

    public executeExistsInAlmanacAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var p = input.Params && input.Params.length > 0 ? input.Params[0] : null;
        if (!p) {
            logger.error('Input parameters not found');
            return {
                Success : false,
                Result  : null
            };
        }
        var key = p.Key;
        if (!key) {
            logger.error('Key not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        // Execute the action
        var result = await this._almanac.getFact(key);

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);

        return {
            Success : result !== null,
            Result  : result !== null
        };
    };

    public executeRestApiCallAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        const p = input.Params.find(x => x.Type === ParamType.RestApiParams);
        if (!p) {
            logger.error('Input parameters not found');
            return {
                Success : false,
                Result  : null
            };
        }

        if (!p.Value) {
            logger.error('Value not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        const restApiParams = p.Value;
        const url = restApiParams.Url;
        const method = restApiParams.Method ?? 'GET';
        const headers = restApiParams.Headers;
        const queryParams = restApiParams.QueryParams;
        const responseField = restApiParams.ResponseField;
        // const responseType = restApiParams.ResponseType;

        var responseBody = null;
        // Execute the action
        try {
            const options = {
                headers : headers,
                json    : true
            };
            var updatedUrl = url;
            if (queryParams && queryParams.length > 0) {
                updatedUrl = url + '?';
                var paramList = [];
                queryParams.forEach((param) => {
                    paramList.push(`${param.Key}=${param.Value}`);
                });
                updatedUrl += paramList.join('&');
            }
            var methodToUse = method.toLowerCase();
            var response = await needle(methodToUse, updatedUrl, options);
            if (response.statusCode === 200) {
                responseBody = response.body;
            }
        }
        catch (error) {
            logger.error(`Error occurred while retrieving award event types!': ${error.message}`);
            return {
                Success : false,
                Result  : null
            };
        }

        var data = null;
        if (responseBody && responseField && responseField.length > 0) {
            data = responseBody[responseField];
        }
        if (data === null) {
            return {
                Success : false,
                Result  : null
            };
        }
        if (output && output.Params && output.Params.length > 0) {
            var op = output.Params[0];
            if (op) {
                await this._almanac.addFact(op.Key, data);
            }
        }
        return {
            Success : true,
            Result  : data
        };
    };

    private getActionParamValue = async (
        input: ActionInputParams,
        type: ParamType,
        paramName?: string) => {

        if (!input || !input.Params || input.Params.length === 0) {
            return null;
        }

        const p = input.Params.find(x => x.Type === type && (!paramName || x.Name === paramName));
        if (!p) {
            return null;
        }
        if (!p.Value) {
            const source = p.Source || InputSourceType.Almanac;
            const key = p.Key;
            if (!key) {
                return null;
            }
            if (source === InputSourceType.Almanac) {
                return await this._almanac.getFact(key);
            }
            return null;
        }
        else {
            return p.Value;
        }
    };

}

// export const executeAction = async (
//     action: ActionInstance,
//     currentNodeInstance: XNodeInstance,
// ): Promise<any> => {

//     const actionType = action.Type;
//     const schemaInstanceId: uuid = currentNodeInstance.SchemaInstanceId;
//     const currentNodeId: uuid = currentNodeInstance.NodeId;
//     const currentNodeInstanceId: uuid = currentNodeInstance.id;
//     const almanac = new Almanac(schemaInstanceId);

//     if (!schemaInstanceId) {
//         logger.error('SchemaInstanceId is required');
//         throw new Error('SchemaInstanceId is required');
//     }

//     if (actionType === ActionType.SendMessage) {
//         return await executeSendMessageAction(action, almanac);
//     }
//     if (actionType === ActionType.StoreToAlmanac) {
//         return await executeStoreToAlmanacAction(action, almanac);
//     }
//     if (actionType === ActionType.GetFromAlmanac) {
//         return await executeGetFromAlmanacAction(action, almanac);
//     }
//     if (actionType === ActionType.ExistsInAlmanac) {
//         const v = await executeGetFromAlmanacAction(action, almanac);
//         return v !== null;
//     }
//     if (actionType === ActionType.Continue) {
//         return true;
//     }
//     if (actionType === ActionType.Exit) {
//         return false;
//     }
//     if (actionType === ActionType.TriggerListeningNode) {
//         return true;
//     }
//     if (actionType === ActionType.TriggerWaitNode) {
//         return true;
//     }

// };

////////////////////////////////////////////////////////////////
