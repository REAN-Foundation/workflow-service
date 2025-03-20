import needle = require('needle');
import { ActionType, InputSourceType, MessageChannelType, OutputDestinationType, ParamType, UserMessageType, WorkflowActivityType } from "../../domain.types/engine/engine.enums";
import { ActionInputParams, ActionOutputParams, ContextParams, Params } from "../../domain.types/engine/params.types";
import { logger } from "../../logger/logger";
import { Almanac } from "./almanac";
import { ChatbotMessageService } from "../communication/chatbot.message.service";
import { NodeActionInstanceResponseDto, NodeInstanceResponseDto } from "../../domain.types/engine/node.instance.types";
import { NodeService } from "../../database/services/engine/node.service";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { NodeInstanceService } from '../../database/services/engine/node.instance.service';
import { DatabaseUtilsService } from '../../database/services/engine/database.utils.service';
import { SchemaResponseDto } from "../../domain.types/engine/schema.domain.types";
import { SchemaInstanceResponseDto } from "../../domain.types/engine/schema.instance.types";
import { EventResponseDto, WorkflowEvent } from "../../domain.types/engine/event.types";
import { NodeActionResult } from "../../domain.types/engine/node.action.types";
import { uuid } from "../../domain.types/miscellaneous/system.types";
import { TimeUtils } from "../../common/utilities/time.utils";
import { WorkflowMessage } from '../../domain.types/engine/user.event.types';
import { NodeResponseDto } from '../../domain.types/engine/node.types';
import ChildSchemaTriggerHandler from './handlers/child.schema.trigger.handler';
import { EventType } from '../../domain.types/engine/engine.enums';
import LogicalTimerNodeTriggerHandler from './handlers/logical.timer.node.trigger.handler';
import { Agent as HttpAgent } from 'http'; // For HTTP
import { Agent as HttpsAgent } from 'https'; // For HTTPS
import { Question } from '../../database/models/engine/question.model';
import { StringUtils } from '../../common/utilities/string.utils';
import TimerNodeTriggerHandler from './handlers/timer.node.trigger.handler';

////////////////////////////////////////////////////////////////

export class ActionExecutioner {

    //#region Construction

    _tenantId: uuid;

    _tenantCode: string;

    _almanac: Almanac;

    _schema: SchemaResponseDto | null = null;

    _schemaInstance: SchemaInstanceResponseDto | null = null;

    _event: EventResponseDto | null = null;

    _nodeService: NodeService = new NodeService();

    _nodeInstanceService: NodeInstanceService = new NodeInstanceService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    _commonUtilsService: DatabaseUtilsService = new DatabaseUtilsService();

    constructor(schema: SchemaResponseDto,
        schemaInstance: SchemaInstanceResponseDto,
        event: EventResponseDto,
        almanac: Almanac) {
        this._schema = schema;
        this._schemaInstance = schemaInstance;
        this._tenantId = schema.TenantId;
        this._tenantCode = schema.TenantCode;
        this._event = event;
        this._almanac = almanac;
    }

    //#endregion

    //#region Publics

    public triggerEventListenerNode = async (
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

        var nodeInstance = await this._nodeInstanceService.getOrCreate(nodeId, this._schemaInstance.id);
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

    public triggerTimerNode = async (
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

        var nodeInstance = await this._nodeInstanceService.getOrCreate(nodeId, this._schemaInstance.id);
        if (!nodeInstance) {
            logger.error(`Unable to create node instance for Node Id: ${nodeId}`);
            return {
                Success : false,
                Result  : null
            };
        }

        const actionType = action.ActionType;

        if (actionType === ActionType.TriggerLogicalTimerNode) {
            await LogicalTimerNodeTriggerHandler.handle({
                Node: node,
                NodeInstance: nodeInstance,
                Event: this._event,
            });
        }
        else {
            await TimerNodeTriggerHandler.handle({
                Node: node,
                NodeInstance: nodeInstance,
                Event: this._event,
            });
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
        var phonenumber = await this.getActionParamValue(input, ParamType.Phone, 'Phone');
        if (!phonenumber) {
            logger.error(`Phone not found in almanac`);
            return {
                Success : false,
                Result  : null
            };
        }

        var messageType = UserMessageType.Text;
        var textMessage = await this.getActionParamValue(input, ParamType.Text, 'Message');
        if (textMessage && textMessage.length > 0) {
            messageType = UserMessageType.Text;
        }
        var location = await this.getActionParamValue(input, ParamType.Location, 'Location');
        if (location) {
            if (!location.Latitude || !location.Longitude) {
                const p = input.Params.find(x => x.Type === ParamType.Location);
                if (p) {
                    var source = p.Source || InputSourceType.Almanac;
                    if (source === InputSourceType.Almanac) {
                        location = await this._almanac.getFact(p.Key);
                    }
                }
            }
            if (location.Latitude && location.Longitude) {
                messageType = UserMessageType.Location;
            }
        }
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
            messageType = UserMessageType.Question;
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
        for await (var placeholder of messagePlaceholders) {
            var placeholderKey = placeholder.Key;
            var placeholderValue = placeholder.Value;
            var source = placeholder.Source || InputSourceType.Almanac;
            if (source === InputSourceType.Almanac) {
                placeholderValue = await this._almanac.getFact(placeholderKey);
                if (placeholderKey === 'Timestamp' || placeholderKey === 'ContextParams:Timestamp') {
                    placeholderValue = new Date(placeholderValue).toLocaleTimeString();
                }
            }
            else if (!placeholderValue &&
                     (placeholderKey === 'Timestamp' || placeholderKey === 'ContextParams:Timestamp')) {
                placeholderValue = new Date().toLocaleTimeString();
            }
            if (placeholderValue) {
                placeholders.push({ Key: placeholderKey, Value: placeholderValue });
            }
        }

        for (var ph of placeholders) {
            var pKey = ph["Key"];
            var pValue = ph["Value"];
            if (textMessage && textMessage.includes(`{{${pKey}}}`)) {
                textMessage = textMessage.replace(`{{${pKey}}}`, pValue);
            }
        }

        const payload = this._event?.Payload;

        var channelType = await this.getMessageChannel(input, payload);

        const message: WorkflowMessage = {
            MessageType          : messageType,
            EventTimestamp       : new Date(),
            MessageChannel       : channelType,
            Phone                : phonenumber,
            TextMessage          : textMessage ?? null,
            Location             : location ?? null,
            ImageUrl             : null,
            AudioUrl             : null,
            VideoUrl             : null,
            QuestionText         : questionNode ? questionNode.Question.QuestionText : null,
            QuestionOptions      : questionNode ? questionNode.Question.Options : null,
            QuestionResponseType : questionNode ? questionNode.Question.ResponseType : null,
            Placeholders         : placeholders,
            Payload              : {
                MessageType               : messageType,
                ProcessingEventId         : this._event?.id,
                ChannelType               : channelType,
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

        const testing = process.env.TESTING === 'true';
        var result = await this.sendBotMessage(message);
        if (result === true || testing) {
            await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        }
        await this.recordActionActivity(action, result);

        return {
            Success : result === true,
            Result  : result
        };
    };

    public executeSendOneMessageToMultipleUsersAction = async (
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
            phonenumebrs = values.map(x => x["Phone"]);
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

        const payload = this._event?.Payload;

        const channelType = await this.getMessageChannel(input, payload);

        const message: WorkflowMessage = {
            MessageType     : UserMessageType.Text,
            EventTimestamp  : new Date(),
            MessageChannel  : channelType,
            TextMessage     : textMessage ?? null,
            Location        : location ?? null,
            QuestionText    : questionNode ? questionNode.Question.QuestionText : null,
            QuestionOptions : questionNode ? questionNode.Question.Options : null,
            Placeholders    : placeholders,
            Payload         : {
                MessageType               : UserMessageType.Text,
                ProcessingEventId         : this._event?.id,
                ChannelType               : channelType,
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

        const failedMessageDeliveries = [];
        // Execute the action
        for (let index = 0; index < phonenumebrs.length; index++) {
            const phonenumber = phonenumebrs[index];
            message.Phone = phonenumber;
            var result = await this.sendBotMessage(message);
            if (!result) {
                failedMessageDeliveries.push(phonenumber);
            }
        }
        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, result);

        if (failedMessageDeliveries.length > 0) {
            logger.error(`Failed to deliver messages to the following phone numbers: ${failedMessageDeliveries.join(',')}`);
            return {
                Success : false,
                Result  : failedMessageDeliveries
            };
        }
        return {
            Success : true,
            Result  : result
        };
    };

    public executeSendMultipleMessagesToOneUserAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        try {
            const input = action.Input as ActionInputParams;
            var phonenumber = await this.getActionParamValue(input, ParamType.Phone, 'Phone');
            if (!phonenumber) {
                logger.error('Phone not found in input parameters');
                return {
                    Success : false,
                    Result  : null
                };
            }

            var pMessageType = input.Params.find(x => x.Type === ParamType.Text && x.Key === 'MessageType');
            var messageType = pMessageType ? pMessageType.Value : UserMessageType.Text;
            messageType = messageType ? messageType : UserMessageType.Text;

            // Get the input parameters
            const p = input.Params.find(x => x.Type === ParamType.Array);
            if (!p) {
                logger.error('Input parameters not found');
                return {
                    Success : false,
                    Result  : null
                };
            }
            var arrayValues = null;
            if (!p.Value) {
                const source = p.Source || InputSourceType.Almanac;
                if (source === InputSourceType.Almanac) {
                    arrayValues = await this._almanac.getFact(p.Key);
                }
            }
            else {
                arrayValues = p.Value;
            }

            if (Array.isArray(arrayValues) === false || !arrayValues || arrayValues?.length === 0) {
                logger.error('Array values not found in input parameters');
                return {
                    Success : false,
                    Result  : null
                };
            }

            var failedMessageDeliveries = [];

            logger.info(`ArrayValues : ${JSON.stringify(arrayValues, null, 2)}`);

            for await (var arrayItem of arrayValues) {

                var textMessage = messageType === UserMessageType.Text ? arrayItem : null;
                var location = messageType === UserMessageType.Location ? arrayItem : null;
                if (location) {
                    if (!location.Latitude || !location.Longitude) {
                        continue;
                    }
                }
                var questionId = messageType === UserMessageType.Question ? arrayItem : null;
                if (!textMessage && !location && !questionId) {
                    continue;
                }

                var questionNode: NodeResponseDto | null = null;
                if (questionId) {
                    questionNode = await this._commonUtilsService.getQuestionNode(questionId);
                    if (!questionNode) {
                        continue;
                    }
                }

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

                const payload = this._event?.Payload;
                const channelType = await this.getMessageChannel(input, payload);

                const message: WorkflowMessage = {
                    MessageType     : UserMessageType.Text,
                    EventTimestamp  : new Date(),
                    MessageChannel  : channelType,
                    TextMessage     : textMessage ?? null,
                    Location        : location ?? null,
                    QuestionText    : questionNode ? questionNode.Question.QuestionText : null,
                    QuestionOptions : questionNode ? questionNode.Question.Options : null,
                    Placeholders    : placeholders,
                    Payload         : {
                        MessageType               : UserMessageType.Text,
                        ProcessingEventId         : this._event?.id,
                        ChannelType               : channelType,
                        ChannelMessageId          : null,
                        PreviousChannelMessageId  : payload ? payload.ChannelMessageId : null,
                        MessageTemplateId         : null,
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

                message.Phone = phonenumber;
                var result = await this.sendBotMessage(message);
                if (!result) {
                    failedMessageDeliveries.push(phonenumber);
                }
            }

            await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
            await this.recordActionActivity(action, failedMessageDeliveries);

            const testing = process.env.TESTING === 'true';
            if (failedMessageDeliveries.length > 0 && !testing) {
                logger.error(`Failed to deliver messages to the following phone numbers: ${failedMessageDeliveries.join(',')}`);
                return {
                    Success : false,
                    Result  : failedMessageDeliveries
                };
            }

            return {
                Success : true,
                Result  : true
            };
        }
        catch (error) {
            logger.error(`Error occurred while sending messages: ${error.message}`);
            return {
                Success : false,
                Result  : error.message
            };
        }

    };

    public executeStoreToAlmanacAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters
        var p = input.Params && input.Params.length > 0 ? input.Params[0] : null;
        if (!p) {
            logger.error('Input parameters not found');
            return {
                Success: false,
                Result: null
            };
        }
        var key = p.Key;
        if (!key) {
            logger.error('Key not found in input parameters');
            return {
                Success: false,
                Result: null
            };
        }
        var inValue = p.Value;
        if (!inValue) {
            if (p.Source && p.Source === InputSourceType.Almanac) {
                inValue = await this._almanac.getFact(p.Key);
                if (inValue) {
                    p.Value = inValue;
                }
            }
        }
        if (!inValue) {
            logger.error('Value not found in input parameters');
            return {
                Success: false,
                Result: null
            };
        }

        const op = output && output.Params && output.Params.length > 0 ? output.Params[0] : null;
        if (op) {
            const currentSchemaInstance = this._schemaInstance;
            if (op.Destination === OutputDestinationType.ParentSchemaAlmanac) {
                const targetSchemaInstanceId = currentSchemaInstance.ParentSchemaInstanceId;
                const success = await this.saveToTargetAlmanac(op, targetSchemaInstanceId, inValue);
                if (!success) {
                    return {
                        Success: false,
                        Result: null
                    };
                }
            }
            else if (op.Destination === OutputDestinationType.ChildSchemaAlmanac) {
                var childrenSchemaInstances = await this._schemaInstanceService.getByParentSchemaInstanceId(currentSchemaInstance.id);
                if (childrenSchemaInstances.length > 0) {
                    for await (var childSchemaInstance of childrenSchemaInstances) {
                        logger.info(`Saving to children almanacs: ${childSchemaInstance.id}`);
                        const targetSchemaInstanceId = childSchemaInstance.id;
                        const success = await this.saveToTargetAlmanac(op, targetSchemaInstanceId, inValue);
                        if (!success) {
                            logger.error(`Failed to save to child schema instance: ${childSchemaInstance.id}`);
                        }
                    }
                }
            }
        }
        else {
            await this._almanac.addFact(key, inValue);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, { Key: key, Value: inValue });

        return {
            Success: true,
            Result: true
        };
    };

    private async saveToTargetAlmanac(op: Params, targetSchemaInstanceId: uuid, inValue: any): Promise<boolean> {
        const targetAlmanac = await Almanac.getAlmanac(targetSchemaInstanceId);
        const outputKey = op.Key;
        if (!outputKey) {
            logger.error('Output Key not found');
            return false;
        }
        var value = inValue;
        if (op.Type === ParamType.Array) {
            var existingValue = await targetAlmanac.getFact(outputKey);
            if (existingValue) {
                if (Array.isArray(existingValue)) {
                    if (Array.isArray(inValue)) {
                        existingValue = existingValue.concat(inValue);
                    }
                    else {
                        existingValue.push(inValue);
                    }
                }
                else {
                    existingValue = [existingValue, inValue];
                }
                value = existingValue;
            }
            else {
                value = [inValue];
            }
        }
        await targetAlmanac.addFact(outputKey, value);
        return true;
    }

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
                var source = p.Source || InputSourceType.Almanac;
                if (source === InputSourceType.Almanac) {
                    p.Value = await this._almanac.getFact(p.Key);
                }
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

        var agent = new HttpAgent({ keepAlive: true });
        if (url.startsWith('https')) {
            agent = new HttpsAgent({ keepAlive: true });
        }
        const options = {
            httpAgent : agent,
            headers   : headers
        };

        var responseBody = null;
        // Execute the action
        try {
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
                    else {
                        param.Value = param.QueryParamValue;
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
            else {
                logger.error(`Error occurred while calling REST api!': ${response.body}`);
                return {
                    Success : false,
                    Result  : null
                };
            }
        }
        catch (error) {
            logger.error(`Error occurred while calling REST api!': ${error.message}`);
            return {
                Success : false,
                Result  : null
            };
        }

        var data = null;
        if (responseBody && responseField && responseField.length > 0) {
            var tokens = responseField.split(':');
            if (tokens.length > 1) {
                var obj = responseBody;
                for (var i = 0; i < tokens.length; i++) {
                    obj = obj[tokens[i]];
                }
                data = obj;
            }
            else {
                data = responseBody[responseField];
            }
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

    public executeGenerateRandomCodeAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var prefix: string = null;
        var pPrefix = input.Params && input.Params.length > 0 ?
            input.Params.find(x => x.Type === ParamType.Text && x.Key === 'Prefix') : null;
        if (pPrefix) {
            prefix = pPrefix.Value ?? '';
        }
        var length = 12;
        var pLength = input.Params && input.Params.length > 0 ?
            input.Params.find(x => x.Type === ParamType.Integer && x.Key === 'Length') : null;
        if (pLength && pLength.Value) {
            length = parseInt(pLength.Value);
        }

        var codeName = 'InstanceCode';
        var pCodeName = input.Params && input.Params.length > 0 ?
            input.Params.find(x => x.Type === ParamType.Text && x.Key === 'CodeName') : null;
        if (pCodeName) {
            codeName = pCodeName.Value;
        }

        const randomCode = StringUtils.generateDisplayCode_RandomChars(length, prefix);

        await this._almanac.addFact(codeName, randomCode);

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, randomCode);

        return {
            Success : true,
            Result  : randomCode
        };
    };

    public executeSetNextNodeAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;

        // Get the input parameters
        var nextNodeId = await this.getActionParamValue(input, ParamType.NodeId);
        if (!nextNodeId) {
            logger.error('NodeId not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        // Execute the action
        var nextNode = await this._nodeService.getById(nextNodeId);
        if (!nextNode) {
            logger.error(`Next Node not found for id: ${nextNodeId}`);
            return {
                Success : false,
                Result  : null
            };
        }

        var nextNodeInstance = await this._nodeInstanceService.getOrCreate(nextNodeId, this._schemaInstance.id);
        if (!nextNodeInstance) {
            logger.error(`Unable to create node instance for Node Id: ${nextNodeId}`);
            return {
                Success : false,
                Result  : null
            };
        }

        await this._schemaInstanceService.setCurrentNodeInstance(this._schemaInstance.id, nextNodeInstance.id);

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, nextNodeInstance);

        return {
            Success : true,
            Result  : {
                currentNode         : nextNode,
                currentNodeInstance : nextNodeInstance
            }
        };
    };

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
        if (!items) {
            return {
                Success : false,
                Result  : null
            };
        }
        if (items?.length === 0) {
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
            const subElementType = inputArrayParam.SubType;

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
                if (cp.Type === ParamType.Text && cp.Key === 'SchemaInstanceCode') {
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
                const exists = childContextParams.find(x => x.Key === cp.Key && x.Value);
                if (exists) {
                    continue;
                }

                var cpValueExists = cp.Value !== null && cp.Value !== undefined;
                if (cp.Type === ParamType.Location && cpValueExists) {
                    cpValueExists = cp.Value.Latitude && cp.Value.Longitude;
                }
                //Similarly check for other types...

                if (cpValueExists) {
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

            await ChildSchemaTriggerHandler.handle(childSchemaInstance);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, items);

        return {
            Success : true,
            Result  : items
        };
    };

    public executeSortArrayAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters
        var pArray = input.Params && input.Params.length > 0 ?
            input.Params.find(x => x.Type === ParamType.Array) : null;
        if (!pArray) {
            logger.error('Array parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var pSortBy = input.Params.find(x => x.Type === ParamType.Text && x.Key === 'SortBy');
        if (!pSortBy) {
            logger.error('SortBy parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var pSortOrder = input.Params.find(x => x.Type === ParamType.Text && x.Key === 'SortOrder');

        var sortBy = pSortBy.Value;
        var sortOrder = pSortOrder ? pSortOrder.Value : 'asc';
        var isAscending = sortOrder === 'asc';
        var array = pArray.Value;

        if (!array) {
            const source = pArray.Source || InputSourceType.Almanac;
            if (source === InputSourceType.Almanac) {
                array = await this._almanac.getFact(pArray.Key);
            }
        }

        if (!array || Array.isArray(array) === false) {
            logger.error('Array not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        var sortedArray = array.sort((a, b) => {
            if (isAscending) {
                return a[sortBy] - b[sortBy];
            }
            return b[sortBy] - a[sortBy];
        });

        var op = output.Params.find(x => x.Destination === OutputDestinationType.Almanac);
        if (op) {
            await this._almanac.addFact(op.Key, sortedArray);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, sortedArray);

        return {
            Success : true,
            Result  : sortedArray
        };

    };

    public executeFilterArrayAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters
        var pArray = input.Params && input.Params.length > 0 ?
            input.Params.find(x => x.Type === ParamType.Array) : null;
        if (!pArray) {
            logger.error('Array parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var pFilterBy = input.Params.find(x => x.Type === ParamType.Text && x.Key === 'FilterBy');
        if (!pFilterBy) {
            logger.error('FilterBy parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var pFilterValue = input.Params.find(x => x.Type === ParamType.Text && x.Key === 'FilterValue');
        if (!pFilterValue) {
            logger.error('FilterValue parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var filterBy = pFilterBy.Value;
        var filterValue = pFilterValue.Value;
        var array = pArray.Value;

        if (!array || Array.isArray(array) === false) {
            logger.error('Array not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        var filteredArray = array.filter(x => x[filterBy] === filterValue);

        var op = output.Params.find(x => x.Destination === OutputDestinationType.Almanac);
        if (op) {
            await this._almanac.addFact(op.Key, filteredArray);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, filteredArray);

        return {
            Success : true,
            Result  : filteredArray
        };

    };

    public executeGetArrayElementAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters
        var pArray = input.Params && input.Params.length > 0 ?
            input.Params.find(x => x.Type === ParamType.Array) : null;
        if (!pArray) {
            logger.error('Array parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var pIndex = input.Params.find(x => x.Type === ParamType.Integer && x.Key === 'Index');
        if (!pIndex) {
            logger.error('Index parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var index = parseInt(pIndex.Value);
        var array = pArray.Value;

        if (!array) {
            const source = pArray.Source || InputSourceType.Almanac;
            if (source === InputSourceType.Almanac) {
                array = await this._almanac.getFact(pArray.Key);
            }
        }

        if (!array || Array.isArray(array) === false) {
            logger.error('Array not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        if (index < 0 || index >= array.length) {
            logger.error('Invalid index');
            return {
                Success : false,
                Result  : null
            };
        }
        var element = array[index];

        var op = output.Params.find(x => x.Destination === OutputDestinationType.Almanac);
        if (op) {
            await this._almanac.addFact(op.Key, element);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, element);

        return {
            Success : true,
            Result  : element
        };

    };

    public executeGetObjectParamAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters
        var pObject = input.Params && input.Params.length > 0 ?
            input.Params.find(x => x.Type === ParamType.Object) : null;
        if (!pObject) {
            logger.error('Object parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var valueObj = pObject.Value;
        if (!valueObj) {
            const source = pObject.Source || InputSourceType.Almanac;
            if (source === InputSourceType.Almanac) {
                valueObj = await this._almanac.getFact(pObject.Key);
            }
        }

        if (!valueObj || typeof valueObj !== 'object') {
            logger.error('Object not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        var pKey = input.Params.find(x => x.Type === ParamType.Text && x.SubType === ParamType.ObjectKey);
        if (!pKey) {
            logger.error('Key parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var key = pKey.Value ?? pKey.Key;
        var value = valueObj[key];

        var op = output.Params.find(x => x.Destination === OutputDestinationType.Almanac);
        if (op) {
            await this._almanac.addFact(op.Key, value);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, valueObj);

        return {
            Success : true,
            Result  : valueObj
        };

    };

    public executeConstructObjectAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters

        var opObjectParam = output.Params.find(x => x.Type === ParamType.Object);
        if (!opObjectParam) {
            logger.error('Object parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        const objParamTypes = opObjectParam.ObjectParamTypes || [];
        if (objParamTypes.length === 0) {
            logger.error('Object param types not found. Cannot create empty objects.');
            return {
                Success : false,
                Result  : null
            };
        }

        var obj = {};

        for (var param of objParamTypes) {
            if (!param.Type && !param.Name) {
                logger.error('Object param type or name not found');
                return {
                    Success : false,
                    Result  : null
                };
            }
            var value = null;
            const p = input.Params.find(x => x.Type === param.Type || x.Key === param.Name);
            if (!p) {
                continue;
            }
            if (p.Value) {
                value = p.Value;
            }
            else {
                if (p.Type === ParamType.DateTime && p.SubType === ParamType.Timestamp) {
                    value = new Date().getTime();
                }
                else {
                    const source = p.Source || InputSourceType.Almanac;
                    if (source === InputSourceType.Almanac) {
                        value = await this._almanac.getFact(p.Key);
                    }
                }
            }
            obj[param.Name] = value;
        }

        //Check if the object is empty
        var isEmpty = obj && Object.keys(obj).length === 0 && obj.constructor === Object;
        if (isEmpty) {
            logger.error('Object is empty');
            return {
                Success : false,
                Result  : null
            };
        }

        var op = output.Params.find(x => x.Destination === OutputDestinationType.Almanac);
        if (op) {
            await this._almanac.addFact(op.Key, obj);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, obj);

        return {
            Success : true,
            Result  : obj
        };

    };

    public executeConstructTextArrayFromTemplateAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters

        var pTemplate = input.Params.find(x => x.Type === ParamType.Text && x.Key === 'Template');
        if (!pTemplate) {
            logger.error('Template parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var pArray = input.Params.find(x => x.Type === ParamType.Array);
        if (!pArray) {
            logger.error('Array parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var template = pTemplate.Value;
        if (!pArray.Value) {
            var source = pArray.Source || InputSourceType.Almanac;
            if (source === InputSourceType.Almanac) {
                pArray.Value = await this._almanac.getFact(pArray.Key);
            }
        }
        var array = pArray.Value;

        if (!array || Array.isArray(array) === false) {
            logger.error('Array not found in input parameters');
            return {
                Success : false,
                Result  : null
            };
        }

        const objectParamTypes = pArray.ObjectParamTypes || [];
        const noObjectParams = !objectParamTypes || objectParamTypes.length === 0;

        var textArray = [];
        for (var item of array) {
            if (noObjectParams) {
                textArray.push(template);
                continue;
            }
            var text = template;
            objectParamTypes.forEach(element => {
                var key = element['Name'];
                var substr = key ? '{{' + key + '}}' : '';
                var replacer = item[key] || '';
                if (replacer && replacer.length > 0 && key.length > 0) {
                    text = text.replace(substr, replacer);
                }
            });
            textArray.push(text);
        }

        var op = output.Params.find(x => x.Destination === OutputDestinationType.Almanac);
        if (op) {
            await this._almanac.addFact(op.Key, textArray);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, textArray);

        return {
            Success : true,
            Result  : textArray
        };

    };

    public executeConstructTextFromTemplateAction = async (
        action: NodeActionInstanceResponseDto): Promise<NodeActionResult> => {

        const input = action.Input as ActionInputParams;
        const output = action.Output as ActionOutputParams;

        // Get the input parameters

        var pTemplate = input.Params.find(x => x.Type === ParamType.Text && x.Key === 'Template');
        if (!pTemplate) {
            logger.error('Template parameter not found');
            return {
                Success : false,
                Result  : null
            };
        }

        var template = pTemplate.Value;
        var objectParams = input.Params.filter(x => x.Type === ParamType.Object);

        var text = template;
        for (var param of objectParams) {
            var substr = param.Key;
            substr = substr ? '{{' + substr + '}}' : '';
            var replacer = param.Value;
            if (replacer) {
                text = text.replace(substr, replacer);
            }
        }

        var op = output.Params.find(x => x.Destination === OutputDestinationType.Almanac);
        if (op) {
            await this._almanac.addFact(op.Key, text);
        }

        await this._commonUtilsService.markActionInstanceAsExecuted(action.id);
        await this.recordActionActivity(action, text);

        return {
            Success : true,
            Result  : text
        };

    };

    public sendBotMessage = async (
        message: WorkflowMessage)
        : Promise<boolean> => {

        var messageService = new ChatbotMessageService();
        const phonenumber = message.Phone;

        const workflowEvent: WorkflowEvent = {
            EventType        : EventType.SystemMessage,
            TenantId         : this._event?.TenantId ?? this._schema.TenantId,
            SchemaId         : this._schema.id,
            SchemaInstanceId : this._schemaInstance.id,
            UserMessage      : message
        };
        var result = await messageService.send(this._tenantCode, phonenumber, workflowEvent);
        return result;
    };

    public sendBotQuestion = async (
        currentNodeInstance: NodeInstanceResponseDto,
        currentNode: NodeResponseDto,
        question: Question): Promise<boolean> => {

        const input = currentNode.Input as ActionInputParams;

        // Get the input parameters
        var phonenumber = await this.getActionParamValue(input, ParamType.Phone, 'Phone');
        if (!phonenumber) {
            logger.error(`Phone not found in almanac`);
            return false;
        }

        const messageTemplateId = await this.getActionParamValue(input, ParamType.Text, 'MessageTemplateId');
        var eventPayload = this._event?.Payload;

        var channelType = await this.getMessageChannel(input, eventPayload);

        const message: WorkflowMessage = {
            MessageType          : UserMessageType.Question,
            EventTimestamp       : new Date(),
            MessageChannel       : channelType,
            Phone                : phonenumber,
            TextMessage          : null,
            Location             : null,
            ImageUrl             : null,
            AudioUrl             : null,
            VideoUrl             : null,
            QuestionText         : question ? question.QuestionText : null,
            QuestionOptions      : question ? question.Options : null,
            QuestionResponseType : question ? question.ResponseType : null,
            Placeholders         : null,
            Payload              : {
                MessageType               : UserMessageType.Question,
                ProcessingEventId         : this._event?.id,
                ChannelType               : channelType,
                ChannelMessageId          : null,
                BotMessageId              : null,
                PreviousChannelMessageId  : eventPayload ? eventPayload.ChannelMessageId : null,
                MessageTemplateId         : messageTemplateId,
                PreviousMessageTemplateId : eventPayload ? eventPayload.MessageTemplateId : null,
                PreviousBotMessageId      : eventPayload ? eventPayload.BotMessageId : null,
                SchemaId                  : this._schema.id,
                SchemaInstanceId          : this._schemaInstance.id,
                SchemaInstanceCode        : this._schemaInstance.Code,
                SchemaName                : this._schema.Name,
                NodeInstanceId            : currentNodeInstance.id,
                NodeId                    : currentNode.id,
                ActionId                  : null,
                Metadata                  : eventPayload ? eventPayload.Metadata : null,
            }
        };
        var messageService = new ChatbotMessageService();

        const workflowEvent: WorkflowEvent = {
            EventType        : EventType.SystemMessage,
            TenantId         : this._event?.TenantId ?? this._schema.TenantId,
            SchemaId         : this._schema.id,
            SchemaInstanceId : this._schemaInstance.id,
            UserMessage      : message
        };
        var result = await messageService.send(this._tenantCode, phonenumber, workflowEvent);
        return result;
    };

    //#endregion

    //#region Privates

    private getActionParamValue = async (
        input: ActionInputParams,
        type: ParamType,
        paramName?: string) => {

        if (paramName) {
            //logger.info(`Getting value for parameter: ${paramName}`);
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

    private getMessageChannel = async (input: ActionInputParams, payload: any): Promise<MessageChannelType> => {
        var p = this._schemaInstance.ContextParams.Params.find(x => x.Key === 'ContextParams:MessageChannel');
        if (!p) {
            p = this._schemaInstance.ContextParams.Params.find(x => x.Key === 'MessageChannel' || x.Type === ParamType.MessageChannel);
        }
        if (p && p.Value) {
            return p.Value as MessageChannelType;
        }

        var messageChannel = await this.getActionParamValue(input, ParamType.MessageChannel, 'ContextParams:MessageChannel');
        if (!messageChannel) {
            messageChannel = await this.getActionParamValue(input, ParamType.MessageChannel, 'MessageChannel');
        }
        if (!messageChannel) {
            messageChannel = this._event?.UserMessage?.MessageChannel as MessageChannelType ?? null;
        }
        if (!messageChannel) {
            messageChannel = payload?.ChannelType as MessageChannelType ?? null;
        }
        if (!messageChannel) {
            messageChannel = MessageChannelType.WhatsApp;
        }
        return messageChannel;
    };

    //#endregion

}

////////////////////////////////////////////////////////////////
