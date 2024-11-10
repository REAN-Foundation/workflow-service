import express from 'express';
import {
    BadgeController
} from './badge.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new BadgeController();
    const contextBase = 'Badge';

    router.post('/', Auth.handle(`${contextBase}.Create`, true, true, true), controller.create);
    router.get('/how-to-earn', Auth.handle(`${contextBase}.GetAll`, true, false, false), controller.getAll);
    router.get('/stock-images', Auth.handle(`${contextBase}.GetStockBadgeImages`, true, false, false), controller.getStockBadgeImages);
    router.get('/search', Auth.handle(`${contextBase}.Search`, true, true, true), controller.search);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, true, true), controller.getById);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, true, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, true, true, true), controller.delete);

    app.use('/api/v1/badges', router);
};
