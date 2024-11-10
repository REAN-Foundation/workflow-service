import express from 'express';
import {
    ParticipantController
} from './participant.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new ParticipantController();
    const contextBase = 'Participant';

    router.post('/', Auth.handle(`${contextBase}.Create`, true, false, false), controller.create);
    router.get('/search', Auth.handle(`${contextBase}.Search`, true, false, false), controller.search);

    router.get('/:id/badges', Auth.handle(`${contextBase}.GetBadges`, true, false, false), controller.getBadges);
    router.get('/by-reference-id/:referenceId', Auth.handle(`${contextBase}.GetByReferenceId`, true, false, false), controller.getByReferenceId);
    router.get('/by-client-id/:clientId', Auth.handle(`${contextBase}.GetByClientId`, true, false, false), controller.getByClientId);

    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, false, false), controller.getById);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, true, false, false), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, false, false), controller.delete);

    app.use('/api/v1/participants', router);
};
