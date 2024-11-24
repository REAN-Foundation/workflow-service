// import express from 'express';
// import { EventController } from './event.controller';
// import { AuthHandler as Auth } from '../../../auth/auth.handler';

// ///////////////////////////////////////////////////////////////////////////////////

// export const register = (app: express.Application): void => {

//     const router = express.Router();
//     const controller = new EventController();
//     const contextBase = 'Event';

//     router.post('/user-message', Auth.handle(`${contextBase}.Create`, true, false, false),
//      controller.createUserMessageEvent);

//     // router.post('/user-message', Auth.handle(`${contextBase}.Create`, true, false, false),
//     //  controller.createUserMessageEvent);

//     router.get('/search', Auth.handle(`${contextBase}.Search`, true, false, false), controller.search);
//     router.get('/:id', Auth.handle(`${contextBase}.GetById`, true, false, false), controller.getById);

//     app.use('/api/v1/engine/events', router);
// };
