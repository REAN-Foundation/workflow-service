import express from 'express';
import {
    SchemaController
} from './schema.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new SchemaController();
    const contextBase = 'Schema';

    // router.get('/:id/export', Auth.handle(`${contextBase}.export`), controller.Export);
    // router.post('/import-file', Auth.handle(`${contextBase}.importFromFile`), controller.ImportFromFile);
    // router.post('/import-json', Auth.handle(`${contextBase}.importFromJson`), controller.ImportFromJson);

    router.post('/', Auth.handle(`${contextBase}.Create`, true, true, true), controller.create);
    router.get('/search', Auth.handle(`${contextBase}.Search`, true, true, true), controller.search);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, true, true), controller.getById);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, true, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, true, true), controller.delete);

    // Routing Prompt endpoints
    router.get('/:id/routing-prompt', Auth.handle(`${contextBase}.GetRoutingPrompt`, true, true, true), controller.getRoutingPrompt);
    router.put('/:id/routing-prompt', Auth.handle(`${contextBase}.SetRoutingPrompt`, true, true, true), controller.setRoutingPrompt);

    app.use('/api/v1/engine/schema', router);
};
