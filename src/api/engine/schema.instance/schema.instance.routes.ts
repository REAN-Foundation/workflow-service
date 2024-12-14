import express from 'express';
import {
    SchemaInstanceController
} from './schema.instance.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new SchemaInstanceController();
    const contextBase = 'SchemaInstance';

    router.post('/', Auth.handle(`${contextBase}.Create`, true, false, false), controller.create);
    router.get('/search', Auth.handle(`${contextBase}.Search`, true, false, false), controller.search);
    router.get('/:id/activity-history', Auth.handle(`${contextBase}.Count`, true, false, false), controller.getActivityHistory);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, false, false), controller.getById);
    // router.put('/:id', Auth.handle(`${contextBase}.Update`, true, false, false), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, false, false), controller.delete);

    app.use('/api/v1/engine/schema-instances', router);
};
