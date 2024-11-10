import express from 'express';
import { UserController } from './user.controller';
import { AuthHandler as Auth } from '../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new UserController();
    const contextBase = 'User';

    router.get('/role-types', Auth.handle(`${contextBase}.GetRoleTypes`, true, false, false), controller.getRoleTypes);

    router.post('', Auth.handle(`${contextBase}.Create`, true, false, false), controller.create);
    router.put('/:id', Auth.handle(`${contextBase}.Update`, false, true, true), controller.update);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, false, true, true), controller.delete);

    router.post('/login-password', Auth.handle(`${contextBase}.LoginWithPassword`, false, false, false), controller.loginWithPassword);
    // router.post('/login-otp', Auth.handle(`${contextBase}.LoginWithOtp`, false, false, false), controller.loginWithOtp);
    // router.post('/generate-otp', Auth.handle(`${contextBase}.SendOtp`, false, false, false), controller.sendOtp);
    router.post('/change-password', Auth.handle(`${contextBase}.ResetPassword`, false, true, true), controller.changePassword);
    router.post('/logout', Auth.handle(`${contextBase}.Logout`, false, true, true), controller.logout);

    router.get('/search', Auth.handle(`${contextBase}.Search`, false, true, true), controller.search);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, false, true, true), controller.getById);

    app.use('/api/v1/users', router);
};
