import needle = require('needle');
import { InputSourceType, MessageChannelType, OutputDestinationType, ParamType, UserMessageType, WorkflowActivityType } from "../../domain.types/engine/engine.enums";
import { ActionInputParams, ActionOutputParams, ContextParams, Params } from "../../domain.types/engine/params.types";
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
import { EngineUtils } from "./engine.utils";
import { uuid } from "../../domain.types/miscellaneous/system.types";
import { TimeUtils } from "../../common/utilities/time.utils";
import { WorkflowMessageEvent } from '../../domain.types/engine/user.event.types';
import { NodeResponseDto } from '../../domain.types/engine/node.types';

////////////////////////////////////////////////////////////////

export class ActionExecutioner {

    //#region Construction

    _almanac: Almanac;

    _schema: SchemaResponseDto | null = null;

    _schemaInstance: SchemaInstanceResponseDto | null = null;

    _event: EventResponseDto | null = null;

    _nodeService: NodeService = new NodeService();

    _nodeInstanceService: NodeInstanceService = new NodeInstanceService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    _commonUtilsService: CommonUtilsService = new CommonUtilsService();

    _engineUtils: EngineUtils = new EngineUtils();

    constructor(schema: SchemaResponseDto,
        schemaInstance: SchemaInstanceResponseDto,
        event: EventResponseDto,
        almanac: Almanac) {
        this._schema = schema;
        this._schemaInstance = schemaInstance;
        this._event = event;
        this._almanac = almanac;
    }

    //#endregion

    //#region Publics

    public ExecuteTriggerListeningNodeAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var nodeId = await this.getActionParamValue(input, ParamType.NodeId);
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

        var [nodeInstance, node] = await this._engineUtils.createNodeInstance(nodeId, this._schemaInstance.id);
        if (!nodeInstance) {
            logger.error(`Unable to create node instance for Node Id: ${nodeId}`);
            return {
                Success : false,
                Result  : null
            };
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, nodeInstance);

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
        var textMessage = await this.getActionParamValue(input, ParamType.Text, 'Message');
        var location = await this.getActionParamValue(input, ParamType.Location, 'Location');
        var questionId = await this.getActionParamValue(input, ParamType.QuestionId, 'QuestionId');
        if (!textMessage && !location && !questionId) {
            logger.error('Text message, question or location not found in bot message input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        var questionNode: NodeResponseDto | null = null;
        if (questionId) {
            questionNode = await this._commonUtilsService.getQuestionNode(questionId);
            if (!questionNode) {
                logger.error(`Question node not found for Id: ${questionId}`);
                return {
                    Success : false,
                    Result  : null
                };
            }
        }
        const messageTemplateId = await this.getActionParamValue(input, ParamType.Text, 'MessageTemplateId');

        const placeholders: { Key: string, Value: string }[] = [];
        var messagePlaceholders = input.Params.filter(x => x.Type === ParamType.Placeholder);
        messagePlaceholders.forEach(async (placeholder) => {
            var placeholderKey = placeholder.Key;
            var placeholderValue = placeholder.Value;
            if (placeholderKey === 'Timestamp' || placeholderKey === 'ContextParams:Timestamp') {
                placeholderValue = new Date().toISOString();
            }
            placeholders.push({ Key: placeholderKey, Value: placeholderValue });
        });

        const payload = this._event.Payload;

        const message: WorkflowMessageEvent = {
            MessageType     : UserMessageType.Text,
            EventTimestamp  : new Date(),
            MessageChannel  : this._event.UserMessage.MessageChannel,
            Phone           : phonenumber,
            TextMessage     : textMessage ?? null,
            Location        : location ?? null,
            Question        : questionNode ? questionNode.Question.QuestionText : null,
            QuestionOptions : questionNode ? questionNode.Question.Options : null,
            Placeholders    : placeholders,
            Payload         : {
                MessageType               : UserMessageType.Text,
                ProcessingEventId         : this._event.id,
                ChannelType               : this._event.UserMessage.MessageChannel as MessageChannelType,
                ChannelMessageId          : null,
                PreviousChannelMessageId  : payload ? payload.ChannelMessageId : null,
                MessageTemplateId         : messageTemplateId,
                PreviousMessageTemplateId : payload ? payload.MessageTemplateId : null,
                BotMessageId              : null,
                PreviousBotMessageId      : payload ? payload.BotMessageId : null,
                SchemaId                  : this._schema.id,
                SchemaInstanceId          : this._schemaInstance.id,
                SchemaInstanceCode        : this._schemaInstance.Code,
                SchemaName                : this._schema.Name,
                NodeInstanceId            : action.NodeInstanceId,
                NodeId                    : action.NodeId,
                ActionId                  : action.id,
                Metadata                  : payload ? payload.Metadata : null,
            }
        };

        var result = await this.sendBotMessage(action, message);
        if (result === true) {
            await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        }
        await this.recordActionActivity(action, result);

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

        var textMessage = await this.getActionParamValue(input, ParamType.Text, 'Message');
        var location = await this.getActionParamValue(input, ParamType.Location, 'Location');
        var questionId = await this.getActionParamValue(input, ParamType.QuestionId, 'QuestionId');
        if (!textMessage && !location && !questionId) {
            logger.error('Text message, question or location not found in bot message input parameters');
            return {
                Success : false,
                Result  : null
            };
        }
        var questionNode: NodeResponseDto | null = null;
        if (questionId) {
            questionNode = await this._commonUtilsService.getQuestionNode(questionId);
            if (!questionNode) {
                logger.error(`Question node not found for Id: ${questionId}`);
                return {
                    Success : false,
                    Result  : null
                };
            }
        }
        const messageTemplateId = await this.getActionParamValue(input, ParamType.Text, 'MessageTemplateId');

        const placeholders: { Key: string, Value: string }[] = [];
        var messagePlaceholders = input.Params.filter(x => x.Type === ParamType.Placeholder);
        messagePlaceholders.forEach(async (placeholder) => {
            var placeholderKey = placeholder.Key;
            var placeholderValue = placeholder.Value;
            if (placeholderKey === 'Timestamp') {
                placeholderValue = new Date().toISOString();
            }
            placeholders.push({ Key: placeholderKey, Value: placeholderValue });
        });

        const payload = this._event.Payload;

        const message: WorkflowMessageEvent = {
            MessageType     : UserMessageType.Text,
            EventTimestamp  : new Date(),
            MessageChannel  : this._event.UserMessage.MessageChannel,
            TextMessage     : textMessage ?? null,
            Location        : location ?? null,
            Question        : questionNode ? questionNode.Question.QuestionText : null,
            QuestionOptions : questionNode ? questionNode.Question.Options : null,
            Placeholders    : placeholders,
            Payload         : {
                MessageType               : UserMessageType.Text,
                ProcessingEventId         : this._event.id,
                ChannelType               : payload ? payload.MessageChannel as MessageChannelType : null,
                ChannelMessageId          : null,
                PreviousChannelMessageId  : payload ? payload.ChannelMessageId : null,
                MessageTemplateId         : messageTemplateId,
                PreviousMessageTemplateId : payload ? payload.MessageTemplateId : null,
                BotMessageId              : null,
                PreviousBotMessageId      : payload ? payload.BotMessageId : null,
                SchemaId                  : this._schema.id,
                SchemaInstanceId          : this._schemaInstance.id,
                SchemaInstanceCode        : this._schemaInstance.Code,
                SchemaName                : this._schema.Name,
                NodeInstanceId            : action.NodeInstanceId,
                NodeId                    : action.NodeId,
                ActionId                  : action.id,
                Metadata                  : payload ? payload.Metadata : null,
            }
        };

        // Execute the action
        for (let index = 0; index < phonenumebrs.length; index++) {
            const phonenumber = phonenumebrs[index];
            message.Phone = phonenumber;
            //If the schemaInstance and schema are different, then

            var result = await this.sendBotMessage(action, message);
            if (!result) {
                return {
                    Success : false,
                    Result  : null
                };
            }
        }
        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, result);

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
        await this.recordActionActivity(action, { Key: key, Value: value });

        return {
            Success : true,
            Result  : true
        };
    };

    public executeUpdateContextParamsAction = async (
        actionInstance: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const schemaInstanceId = actionInstance.SchemaInstanceId;
        const input = actionInstance.Input as ActionInputParams;

        var schemaInstance = await this._schemaInstanceService.getById(schemaInstanceId);
        if (!schemaInstance) {
            logger.error(`Schema Instance not found for Id: ${schemaInstanceId}`);
            return {
                Success : false,
                Result  : null
            };
        }
        for await (var p of input.Params) {
            if (!p.Key) {
                logger.error('Key not found in input parameters');
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
            await this._schemaInstanceService.updateContextParams(schemaInstanceId, p);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(actionInstance.id);
        await this.recordActionActivity(actionInstance, {
            SchemaInstanceId : schemaInstanceId,
            UpdatedParams    : input.Params
        });

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
        await this.recordActionActivity(action, { key: key, value: result });

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
        await this.recordActionActivity(action, { key: key, value: result, exists: result !== null });

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
                for (var param of queryParams) {
                    if (!param.QueryParamValue) {
                        var source = param.Source || InputSourceType.Almanac;
                        if (source === InputSourceType.Almanac) {
                            var v = await this._almanac.getFact(param.SourceKey);
                            if (v && param.SourceValueKey) {
                                v = v[param.SourceValueKey];
                            }
                            param.Value = v;
                        }
                    }
                    paramList.push(`${param.QueryParamKey}=${param.Value}`);
                }
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
            if (op && op.Destination === OutputDestinationType.Almanac) {
                await this._almanac.addFact(op.Key, data);
            }
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action,
            {
                url           : url,
                method        : method,
                headers       : headers,
                queryParams   : queryParams,
                responseField : responseField,
                responseData  : data
            });

        return {
            Success : true,
            Result  : data
        };
    };

    // public executeTriggerChildWorkflowAction = async (
    //     action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

    //     const input = action.Input as ActionInputParams;

    //     // Get the input parameters
    //     var childSchemaId = await this.getActionParamValue(input, ParamType.SchemaId);
    //     if (!childSchemaId) {
    //         logger.error('SchemaId not found in input parameters');
    //         return {
    //             Success : false,
    //             Result  : null
    //         };
    //     }

    //     var params = input.Params.filter(x => x.Type !== ParamType.SchemaId);
    //     var childSchemaInstance = await this.createChildSchemaInstance(childSchemaId, this._schemaInstance, params);
    //     if (!childSchemaInstance) {
    //         logger.error('Error while creating child schema instance');
    //         return {
    //             Success : false,
    //             Result  : null
    //         };
    //     }

    //     await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
    //     await this.recordActionActivity(action, childSchemaInstance);

    //     const childSchema = await this._schemaService.getById(childSchemaInstance.Schema?.id);

    //     if (childSchema.ExecuteImmediately) {
    //         await this._engineUtils.executeSchema(childSchemaInstance);
    //     }

    //     return {
    //         Success : true,
    //         Result  : childSchemaInstance
    //     };
    // };

    public executeTriggerMultipleChildrenWorkflowAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters
        var inputArrayParam: Params = input.Params.find(x => x.Type === ParamType.Array);
        if (!inputArrayParam) {
            logger.error('Input parameters not found');
            return {
                Success : false,
                Result  : null
            };
        }
        var items = null;
        if (!inputArrayParam.Value) {
            const source = inputArrayParam.Source || InputSourceType.Almanac;
            if (source === InputSourceType.Almanac) {
                items = await this._almanac.getFact(inputArrayParam.Key);
            }
        }
        else {
            items = inputArrayParam.Value;
        }
        if (items === null || items.length === 0) {
            return {
                Success : false,
                Result  : null
            };
        }

        var pChildSchemaId = input.Params.find(x => x.Type === ParamType.SchemaId);
        if (!pChildSchemaId) {
            logger.error('SchemaId not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        var childSchemaId = pChildSchemaId.Value;
        if (!childSchemaId) {
            logger.error('SchemaId not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        const childSchema = await this._schemaService.getById(childSchemaId);
        if (!childSchema) {
            logger.error(`Child schema not found for Id: ${childSchemaId}`);
            return {
                Success : false,
                Result  : null
            };
        }

        const parentSchemaInstanceId = action.SchemaInstanceId;
        const parentSchemaInstance = await this._schemaInstanceService.getById(parentSchemaInstanceId);
        if (!parentSchemaInstance) {
            logger.error(`Parent schema instance not found for Id: ${parentSchemaInstanceId}`);
            return {
                Success : false,
                Result  : null
            };
        }

        const parentContextParams = parentSchemaInstance.ContextParams;
        const childSchemaContextParams = childSchema.ContextParams.Params;
        const actionInputParams = input.Params.filter(x => x.Type !== ParamType.SchemaId && x.Type !== ParamType.Array);
        const actionOutputParams = output.Params.filter(x => x.Type !== ParamType.SchemaId && x.Type !== ParamType.Array);

        // For each value in the array, create a child schema instance
        for (let i = 0; i < items.length; i++) {

            const arrayItem = items[i];
            const subElementType = inputArrayParam.SubElementType;

            const childContextParams: Params[] = [];

            for (let j = 0; j < actionOutputParams.length; j++) {
                const op = actionOutputParams[j];
                if (op.Type === subElementType) {
                    const outputParam = {
                        Name     : op.Name,
                        Type     : op.Type,
                        Key      : op.Key,
                        Value    : arrayItem[subElementType],
                        Required : true,
                    };
                    childContextParams.push(outputParam);
                }
            }

            const schemaIdParam = input.Params.find(x => x.Type === ParamType.SchemaId);
            if (schemaIdParam) {
                const outputParam = {
                    Name     : schemaIdParam.Name,
                    Type     : schemaIdParam.Type,
                    Key      : schemaIdParam.Key,
                    Value    : schemaIdParam.Value,
                    Required : true,
                };
                childContextParams.push(outputParam);
            }

            for (let k = 0; k < actionInputParams.length; k++) {
                const ip = actionInputParams[k];
                const actionParam = parentContextParams.Params.find(x => x.Key === ip.Key && x.Type === ip.Type);
                if (!actionParam || !actionParam.Value) {
                    continue;
                }
                if (ip.Value) {
                    childContextParams.push(ip);
                }
                else {
                    childContextParams.push(actionParam);
                }
            }

            for (let l = 0; l < childSchemaContextParams.length; l++) {
                const cp = childSchemaContextParams[l];
                if (cp.Type === ParamType.SchemaInstanceId && cp.Key === 'ParentSchemaInstanceId') {
                    const outputParam = {
                        Name     : cp.Name,
                        Type     : cp.Type,
                        Key      : cp.Key,
                        Value    : parentSchemaInstanceId,
                        Required : true,
                    };
                    childContextParams.push(outputParam);
                    continue;
                }
                if (cp.Type === ParamType.SchemaId && cp.Key === 'ParentSchemaId') {
                    const outputParam = {
                        Name     : cp.Name,
                        Type     : cp.Type,
                        Key      : cp.Key,
                        Value    : parentSchemaInstance.Schema?.id,
                        Required : true,
                    };
                    childContextParams.push(outputParam);
                    continue;
                }
                if (cp.Type === ParamType.Text || cp.Key === 'SchemaInstanceCode') {
                    const outputParam = {
                        Name     : cp.Name,
                        Type     : cp.Type,
                        Key      : cp.Key,
                        Value    : null,
                        Required : true,
                    };
                    childContextParams.push(outputParam);
                    continue;
                }

                const parentParam = parentContextParams.Params.find(x => x.Key === cp.Key);
                if (!parentParam || !parentParam.Value) {
                    continue;
                }
                const exists = childContextParams.find(x => x.Key === cp.Key);
                if (exists) {
                    continue;
                }
                if (cp.Value) {
                    childContextParams.push(cp);
                }
                else {
                    childContextParams.push(parentParam);
                }
            }

            var childSchemaInstance = await this.createChildSchemaInstance(
                childSchemaId, this._schemaInstance, childContextParams);
            if (!childSchemaInstance) {
                logger.error('Error while creating child schema instance');
                return {
                    Success : false,
                    Result  : null
                };
            }
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, items);

        return {
            Success : true,
            Result  : items
        };
    };

    //#endregion

    //#region Privates

    private getActionParamValue = async (
        input: ActionInputParams,
        type: ParamType,
        paramName?: string) => {

        if (paramName) {
            logger.info(`Getting value for parameter: ${paramName}`);
        }

        if (!input || !input.Params || input.Params.length === 0) {
            return null;
        }

        const p = input.Params.find(x => x.Type === type);
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

    private createChildSchemaInstance = async (
        childSchemaId: uuid,
        parentSchemaInstance: SchemaInstanceResponseDto,
        params: Params[]
    ) => {

        try {
            if (!parentSchemaInstance) {
                logger.error(`Parent schema instance not found!`);
                return null;
            }

            const childSchema = await this._schemaService.getById(childSchemaId);
            if (!childSchema) {
                logger.error(`Child schema not found!`);
                return null;
            }

            const padZero = (num: number, size: number) => String(num).padStart(size, '0');
            const pattern = TimeUtils.formatDateToYYMMDD(new Date());
            var instanceCount = await this._schemaInstanceService.getCount(childSchema.TenantId, childSchema.id, pattern);
            const formattedCount = padZero(instanceCount + 1, 3); // Count with leading zeros (e.g., 001)
            var code = 'E-' + pattern + '-' + formattedCount;

            const schemaInstanceContextParams: ContextParams = {
                Name   : 'ContextParams',
                Params : params
            };
            for (var p of params) {
                if (p.Value) {
                    continue;
                }
                if (p.Type === ParamType.Text) {
                    if (p.Key === 'SchemaInstanceCode') {
                        p.Value = code;
                    }
                }
            }

            const rootNode = await this._commonUtilsService.getNode(childSchema.RootNode.id);
            if (!rootNode) {
                logger.error(`Root node not found for child schema!`);
                return null;
            }

            const childSchemaInstance = await this._schemaInstanceService.create({
                TenantId               : childSchema.TenantId,
                SchemaId               : childSchema.id,
                ParentSchemaInstanceId : parentSchemaInstance.id,
                ContextParams          : schemaInstanceContextParams,
                Code                   : code,
            });

            if (!childSchemaInstance) {
                logger.error(`Error while creating schema instance!`);
                return null;
            }

            return childSchemaInstance;
        }
        catch (error) {
            logger.error(`Error while creating child schema instance: ${error.message}`);
            logger.error(`Stack: ${error.stack}`);
            return null;
        }
    };

    private recordActionActivity = async (
        action: NodeActionInstanceResponseDto,
        result: any) => {

        const activityPayload = {
            NodeInstanceId : action.NodeInstanceId,
            NodeId         : action.NodeId,
            ActionType     : action.ActionType,
            Action         : action,
            ActionResult   : result,
        };
        const summary = {
            Type        : "Action",
            Sequence    : action.Sequence,
            ActionType  : action.ActionType,
            CurrentNode : action.Action?.ParentNode?.Name ?? null,
            Name        : action.Action.Name,
            Description : action.Action.Description ?? null,
            Timestamp   : new Date(),
        };
        await this._schemaInstanceService.recordActivity(
            action.SchemaInstanceId, WorkflowActivityType.NodeAction, activityPayload, summary);
    };

    private sendBotMessage = async (
        action: NodeActionInstanceResponseDto,
        message: WorkflowMessageEvent)
        : Promise<boolean> => {

        var messageService = new ChatbotMessageService();

        var eventPayload = this._event.Payload;

        const phonenumber = message.Phone;
        const textMessage = message.TextMessage;
        const imageUrl = message.ImageUrl || null;
        const audioUrl = message.AudioUrl || null;
        const videoUrl = message.VideoUrl || null;
        const location = message.Location || null;
        const question = message.Question || null;
        const questionOptions = message.QuestionOptions || null;
        const messageType = message.MessageType;

        const messageEvent: WorkflowMessageEvent = {
            MessageType     : messageType,
            EventTimestamp  : new Date(),
            MessageChannel  : this._event.UserMessage.MessageChannel,
            Phone           : phonenumber,
            TextMessage     : textMessage,
            Location        : location,
            ImageUrl        : imageUrl,
            AudioUrl        : audioUrl,
            VideoUrl        : videoUrl,
            Question        : question,
            QuestionOptions : questionOptions,
            Payload         : {
                MessageType              : UserMessageType.Text,
                ProcessingEventId        : this._event.id,
                ChannelMessageId         : null,
                BotMessageId             : null,
                ChannelType              : eventPayload ? eventPayload.MessageChannel as MessageChannelType : null,
                PreviousChannelMessageId : eventPayload ? eventPayload.ChannelMessageId : null,
                PreviousBotMessageId     : eventPayload ? eventPayload.BotMessageId : null,
                SchemaId                 : this._schema.id,
                SchemaInstanceId         : this._schemaInstance.id,
                SchemaInstanceCode       : this._schemaInstance.Code,
                SchemaName               : this._schema.Name,
                NodeInstanceId           : action.NodeInstanceId,
                NodeId                   : action.NodeId,
                ActionId                 : action.id,
            }
        };
        var result = await messageService.send(phonenumber, messageEvent);
        return result;
    };

    //#endregion

}

////////////////////////////////////////////////////////////////
