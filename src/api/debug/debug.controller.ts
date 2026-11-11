import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { MessageCaptureStore } from '../../modules/communication/message.capture.store';

///////////////////////////////////////////////////////////////////////////////////

export class DebugController {

    getAllMessages = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            const messages = MessageCaptureStore.getAll();
            ResponseHandler.success(request, response, 'Captured messages retrieved successfully!', 200, messages);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getMessagesBySchemaInstance = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            const schemaInstanceId = request.params.schemaInstanceId;
            const messages = MessageCaptureStore.getBySchemaInstance(schemaInstanceId);
            ResponseHandler.success(request, response, 'Captured messages retrieved successfully!', 200, messages);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    clearMessages = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            MessageCaptureStore.clear();
            ResponseHandler.success(request, response, 'Captured messages cleared!', 200, true);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
