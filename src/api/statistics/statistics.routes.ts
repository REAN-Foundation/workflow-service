import express from 'express';
import { StatisticsController } from './statistics.controller';
import { AuthHandler as Auth } from '../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new StatisticsController();
    const contextBase = 'Statistics';

    router.get('/workflow-instances', Auth.handle(`${contextBase}.WorkflowInstanceStats`, true, true, true), controller.getWorkflowInstanceStats);
    router.get('/workflows', Auth.handle(`${contextBase}.WorkflowDefinitionStats`, true, true, true), controller.getWorkflowDefinitionStats);
    router.get('/daily-trend', Auth.handle(`${contextBase}.DailyTrend`, true, true, true), controller.getDailySchemaInstanceTrend);
    router.get('/workflow-insights', Auth.handle(`${contextBase}.WorkflowInsights`, true, true, true), controller.getWorkflowInsights);

    app.use('/api/v1/statistics', router);
};
