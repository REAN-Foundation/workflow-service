import express from 'express';
import {
    ParticipantGroupController
} from './participant.group.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new ParticipantGroupController();
    const contextBase = 'BadgeCategory';

    router.post('/', Auth.handle(`${contextBase}.Create`, true, true, true), controller.create);
    router.get('/search', Auth.handle(`${contextBase}.Search`, true, true, true), controller.search);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, true, true), controller.getById);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, true, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, true, true), controller.delete);

    router.post('/:id/participants/', Auth.handle(`${contextBase}.AddParticipant`, true, true, true), controller.addParticipant);
    router.delete('/:id/participants/:participantId', Auth.handle(`${contextBase}.RemoveParticipant`, true, true, true), controller.removeParticipant);
    router.get('/:id/participants/', Auth.handle(`${contextBase}.GetParticipants`, true, true, true), controller.getParticipants);

    app.use('/api/v1/participant-groups', router);
};
