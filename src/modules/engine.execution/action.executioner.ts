import { XNodeInstance } from "../../domain.types/engine/intermediate.types/node.types";
import { XAction } from "../../domain.types/engine/intermediate.types/action.types";
import { ActionType, InputSourceType, OutputDestinationType, ParamType } from "../../domain.types/engine/engine.enums";
import { ActionInputParams, OutputParams } from "../../domain.types/engine/intermediate.types/params.types";
import { logger } from "../../logger/logger";
import { Almanac } from "./almanac";
import { uuid } from "../../domain.types/miscellaneous/system.types";
import { ChatbotMessageService } from "../communication/chatbot.message.service";

////////////////////////////////////////////////////////////////

const getActionParamValue = async (
    almanac: Almanac,
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
            return await almanac.getFact(key);
        }
        return null;
    }
    else {
        return p.Value;
    }
};

export const executeAction = async (
    action: XAction,
    currentNodeInstance: XNodeInstance,
): Promise<any> => {

    const actionType = action.Type;
    const schemaInstanceId: uuid = currentNodeInstance.SchemaInstanceId;
    const currentNodeId: uuid = currentNodeInstance.NodeId;
    const currentNodeInstanceId: uuid = currentNodeInstance.id;
    const almanac = new Almanac(schemaInstanceId);

    if (!schemaInstanceId) {
        logger.error('SchemaInstanceId is required');
        throw new Error('SchemaInstanceId is required');
    }

    if (actionType === ActionType.SendMessage) {
        return await executeSendMessageAction(action, almanac);
    }
    if (actionType === ActionType.StoreToAlmanac) {
        return await executeStoreToAlmanacAction(action, almanac);
    }
    if (actionType === ActionType.GetFromAlmanac) {
        return await executeGetFromAlmanacAction(action, almanac);
    }
    if (actionType === ActionType.ExistsInAlmanac) {
        const v = await executeGetFromAlmanacAction(action, almanac);
        return v !== null;
    }
    if (actionType === ActionType.Continue) {
        return true;
    }
    if (actionType === ActionType.Exit) {
        return false;
    }
    if (actionType === ActionType.TriggerListeningNode) {
        return true;
    }
    if (actionType === ActionType.TriggerWaitNode) {
        return true;
    }

};

async function executeSendMessageAction(action: XAction, almanac: Almanac) {
    const input = action.Input as ActionInputParams;

    // Get the input parameters
    var phonenumber = await getActionParamValue(almanac, input, ParamType.Phonenumber, 'Phonenumber');
    if (!phonenumber) {
        logger.error(`Phonenumber not found in almanac`);
        return false;
    }
    var message = await getActionParamValue(almanac, input, ParamType.Text, 'Message');
    if (!message) {
        logger.error('Message not found in input parameters');
        return false;
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
    if (result) {
        var actionId = action.id;
    }
    return result;
}

async function executeStoreToAlmanacAction(action: XAction, almanac: Almanac) {
    const input = action.Input as ActionInputParams;

    // Get the input parameters
    var p = input.Params && input.Params.length > 0 ? input.Params[0] : null;
    if (!p) {
        logger.error('Input parameters not found');
        return false;
    }
    var key = p.Key;
    if (!key) {
        logger.error('Key not found in input parameters');
        return false;
    }
    var value = p.Value;
    if (!value) {
        logger.error('Value not found in input parameters');
        return false;
    }

    // Execute the action
    await almanac.addFact(key, value);

    return true;
}

async function executeGetFromAlmanacAction(action: XAction, almanac: Almanac) {

    const input = action.Input as ActionInputParams;

    // Get the input parameters
    var p = input.Params && input.Params.length > 0 ? input.Params[0] : null;
    if (!p) {
        logger.error('Input parameters not found');
        return null;
    }
    var key = p.Key;
    if (!key) {
        logger.error('Key not found in input parameters');
        return null;
    }

    // Execute the action
    return await almanac.getFact(key);
}

////////////////////////////////////////////////////////////////
