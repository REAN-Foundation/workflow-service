import express from 'express';
import { DebugController } from './debug.controller';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new DebugController();

    router.get('/messages', controller.getAllMessages);
    router.get('/messages/:schemaInstanceId', controller.getMessagesBySchemaInstance);
    router.delete('/messages', controller.clearMessages);

    app.use('/api/v1/debug', router);
};
