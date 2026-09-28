import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { StatisticsValidator } from './statistics.validator';
import { StatisticsService } from '../../database/services/statistics/statistics.service';
import { SchemaService } from '../../database/services/engine/schema.service';
import { ApiError } from '../../common/handlers/error.handler';

///////////////////////////////////////////////////////////////////////////////////////

export class StatisticsController {

    //#region member variables and constructors

    _service: StatisticsService = new StatisticsService();

    _validator: StatisticsValidator = new StatisticsValidator();

    _schemaService: SchemaService = new SchemaService();

    //#endregion

    getWorkflowInstanceStats = async (request: express.Request, response: express.Response) => {
        try {
            const filters = await this._validator.validateStatsFilters(request);
            const stats = await this._service.getWorkflowInstanceStats(filters);
            const message = 'Workflow instance statistics retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, stats);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getWorkflowDefinitionStats = async (request: express.Request, response: express.Response) => {
        try {
            const filters = await this._validator.validateWorkflowDefinitionStatsFilters(request);
            const stats = await this._service.getWorkflowDefinitionStats(filters);
            const message = 'Workflow definition statistics retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, stats);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getDailySchemaInstanceTrend = async (request: express.Request, response: express.Response) => {
        try {
            const filters = await this._validator.validateDailyTrendFilters(request);
            const stats = await this._service.getDailySchemaInstanceTrend(filters);
            const message = 'Daily schema instance trend retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, stats);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getWorkflowInsights = async (request: express.Request, response: express.Response) => {
        try {
            const filters = await this._validator.validateSchemaInstanceListFilters(request);
            let fileds: string[] = [];

            const schema = await this._schemaService.getById(filters.SchemaId);
            if (!schema) {
                throw new ApiError('Schema not found for the given schemaId.', 404);
            }
            fileds = await this.extractSchemaFields(schema.ContextParams);
            
            const schemaInstanceDetails = await this._service.getWorkflowInsights(filters, fileds);
            const message = 'Workflow insights retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, schemaInstanceDetails);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    private extractSchemaFields = async (contextParams: any): Promise<string[]> => {
        const fields: string[] = [];
        if (contextParams && contextParams.Params && contextParams.Params.length > 0) {
            for (const param of contextParams.Params) {
                if (param.Key) {
                    fields.push(param.Key);
                }
            }
        }
        return fields;
    };

}
