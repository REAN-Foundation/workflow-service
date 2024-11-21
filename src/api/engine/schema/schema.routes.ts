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

    router.post('/:id/nodes', Auth.handle(`${contextBase}.AddNode`), controller.addNode);
    router.get('/nodes/search', Auth.handle(`${contextBase}.SearchNodes`), controller.searchNodes);
    router.get('/:id/nodes/:nodeId', Auth.handle(`${contextBase}.GetNode`), controller.getNode);
    router.put('/:id/nodes/:nodeId', Auth.handle(`${contextBase}.UpdateNode`), controller.updateNode);
    router.delete('/:id/nodes/:nodeId', Auth.handle(`${contextBase}.DeleteNode`), controller.deleteNode);

    router.post('/:id/nodes/:nodeId/paths/:pathId/set-next-node/:nextNodeId', Auth.handle(`${contextBase}.SetNextNodeToPath`), controller.setNextNodeToPath);
    router.post('/:id/nodes/:nodeId/paths/:pathId/conditions', Auth.handle(`${contextBase}.AddPathCondition`), controller.addPathCondition);
    router.put('/:id/nodes/:nodeId/paths/:pathId/conditions/:conditionId', Auth.handle(`${contextBase}.UpdatePathCondition`), controller.updatePathCondition);
    router.get('/:id/nodes/:nodeId/paths/:pathId/conditions/:conditionId', Auth.handle(`${contextBase}.GetPathCondition`), controller.getPathCondition);
    router.delete('/:id/nodes/:nodeId/paths/:pathId/conditions/:conditionId', Auth.handle(`${contextBase}.DeletePathCondition`), controller.deletePathCondition);
    router.get('/:id/nodes/:nodeId/paths/:pathId/conditions', Auth.handle(`${contextBase}.GetPathConditionsForPath`), controller.getPathConditionsForPath);

    router.get('/:id/nodes/:nodeId/paths', Auth.handle(`${contextBase}.GetNodePaths`), controller.getNodePaths);
    router.post('/:id/nodes/:nodeId/paths', Auth.handle(`${contextBase}.AddPath`), controller.addPath);
    router.put('/:id/nodes/:nodeId/paths/:pathId', Auth.handle(`${contextBase}.UpdatePath`), controller.updatePath);
    router.get('/:id/nodes/:nodeId/paths/:pathId', Auth.handle(`${contextBase}.GetPath`), controller.getPath);
    router.delete('/:id/nodes/:nodeId/paths/:pathId', Auth.handle(`${contextBase}.DeletePath`), controller.deletePath);

    router.post('/:id/scoring-conditions/', Auth.handle(`${contextBase}.AddScoringCondition`), controller.addScoringCondition);
    router.put('/:id/scoring-conditions/:conditionId', Auth.handle(`${contextBase}.UpdateScoringCondition`), controller.updateScoringCondition);
    router.get('/:id/scoring-conditions/:conditionId', Auth.handle(`${contextBase}.GetScoringCondition`), controller.getScoringCondition);
    router.delete('/:id/scoring-conditions/:conditionId', Auth.handle(`${contextBase}.DeleteScoringCondition`), controller.deleteScoringCondition);

    // router.get('/:id/export', Auth.handle(`${contextBase}.export`), controller.Export);
    // router.post('/import-file', Auth.handle(`${contextBase}.importFromFile`), controller.ImportFromFile);
    // router.post('/import-json', Auth.handle(`${contextBase}.importFromJson`), controller.ImportFromJson);

    router.post('/', Auth.handle(`${contextBase}.Create`, true, true, true), controller.create);
    router.get('/search', Auth.handle(`${contextBase}.Search`, true, true, true), controller.search);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, true, true), controller.getById);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, true, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, true, true), controller.delete);

    app.use('/api/v1/engine/schema', router);
};
