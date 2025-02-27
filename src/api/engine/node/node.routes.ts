import express from 'express';
import {
    NodeController
} from './node.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new NodeController();
    const contextBase = 'Node';

    router.post('/question-node', Auth.handle(`${contextBase}.CreateQuestionNode`, true, true, true), controller.createQuestionNode);
    router.post('/yes-no-node', Auth.handle(`${contextBase}.CreateYesNoNode`, true, true, true), controller.createYesNoNode);
    router.post('/listening-node', Auth.handle(`${contextBase}.CreateListeningNode`, true, true, true), controller.createListeningNode);
    router.post('/timer-node', Auth.handle(`${contextBase}.CreateTimerNode`, true, true, true), controller.createTimerNode);

    router.post('/', Auth.handle(`${contextBase}.Create`, true, true, true), controller.create);
    router.put('/:id/next-node/:nextNodeId', Auth.handle(`${contextBase}.SetNextNode`, true, true, true), controller.setNextNode);
    router.put('/:id/base-rule/:ruleId', Auth.handle(`${contextBase}.SetBaseRuleToNode`, true, true, true), controller.setBaseRuleToNode);
    router.put('/:id/next-node-on-timer-success/:nextNodeId', Auth.handle(`${contextBase}.SetNextNodeOnTimerSuccess`, true, true, true), controller.setNextNodeOnTimerSuccess);
    router.put('/:id/next-node-on-timer-timeout/:nextNodeId', Auth.handle(`${contextBase}.SetNextNodeOnTimerTimeout`, true, true, true), controller.setNextNodeOnTimerTimeout);

    router.get('/search', Auth.handle(`${contextBase}.Search`, true, true, true), controller.search);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, true, true), controller.getById);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, true, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, true, true), controller.delete);

    app.use('/api/v1/engine/nodes', router);
};
