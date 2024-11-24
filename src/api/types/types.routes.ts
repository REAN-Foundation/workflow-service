import express from 'express';
import {
    TypesController
} from './types.controller';
import { AuthHandler as Auth } from '../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new TypesController();
    const contextBase = 'Types';

    router.get('/role-types', Auth.handle(`${contextBase}.GetRoleTypes`, false, false, false), controller.getRoleTypes);
    router.get('/condition-operator-types', Auth.handle(`${contextBase}.GetConditionOperatorTypes`, false, false, false), controller.getConditionOperatorTypes);
    router.get('/logical-operator-types', Auth.handle(`${contextBase}.GetLogicalOperatorTypes`, false, false, false), controller.getLogicalOperatorTypes);
    router.get('/composite-operator-types', Auth.handle(`${contextBase}.GetCompositeOperatorTypes`, false, false, false), controller.getCompositeOperatorTypes);
    router.get('/mathematical-operator-types', Auth.handle(`${contextBase}.GetMathematicalOperatorTypes`, false, false, false), controller.getMathematicalOperatorTypes);
    router.get('/operand-data-types', Auth.handle(`${contextBase}.GetOperandDataTypes`, false, false, false), controller.getOperandDataTypes);
    router.get('/execution-status-types', Auth.handle(`${contextBase}.GetExecutionStatusTypes`, false, false, false), controller.getExecutionStatusTypes);
    router.get('/input-source-types', Auth.handle(`${contextBase}.GetInputSourceTypes`, false, false, false), controller.getInputSourceTypes);

    app.use('/api/v1/types', router);
};
