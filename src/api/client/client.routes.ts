import express from 'express';
import { ClientController } from './client.controller';
import { AuthHandler as Auth } from '../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new ClientController();
    const contextBase = 'ApiClient';

    router.post('/', Auth.handle(`${contextBase}.Create`, false, true, true), controller.create);

    router.get('/:clientCode/current-api-key', Auth.handle(`${contextBase}.GetCurrentApiKey`, false, false, false), controller.getCurrentApiKey);
    router.put('/:clientCode/renew-api-key', Auth.handle(`${contextBase}.RenewApiKey`, false, false, false), controller.renewApiKey);

    router.get('/search', Auth.handle(`${contextBase}.Search`, false, true, true), controller.search);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, false, true, true), controller.getById);
    router.get('/', Auth.handle(`${contextBase}.GetByApiKey`, true, false, false), controller.getByApiKey);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, false, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, false, true, true), controller.delete);

    app.use('/api/v1/clients', router);
};
