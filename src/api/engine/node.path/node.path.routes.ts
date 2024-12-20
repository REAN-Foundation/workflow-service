import express from 'express';
import {
    NodePathController
} from './node.path.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new NodePathController();
    const contextBase = 'NodePath';

    router.post('/', Auth.handle(`${contextBase}.Create`, true, true, true), controller.create);
    router.get('/search', Auth.handle(`${contextBase}.Search`, true, true, true), controller.search);
    router.get('/nodes/:nodeId', Auth.handle(`${contextBase}.GetNodePaths`, true, true, true), controller.getNodePaths);
    router.post('/:id/next-node/:nodeId', Auth.handle(`${contextBase}.SetNextNodeToPath`, true, true, true), controller.setNextNodeToPath);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, true, true), controller.getById);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, true, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, true, true), controller.delete);

    app.use('/api/v1/engine/node-paths', router);
};
