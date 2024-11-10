import joi from 'joi';
import express from 'express';
import { ErrorHandler } from '../common/handlers/error.handler';
import { uuid } from '../domain.types/miscellaneous/system.types';

//////////////////////////////////////////////////////////////////

export default class BaseValidator {

    public requestParamAsUUID = async (request: express.Request, paramName: string): Promise<uuid> => {
        try {
            const schema = joi.string().uuid({version: 'uuidv4'}).required();
            const param = request.params[paramName];
            await schema.validateAsync(param);
            return request.params[paramName];
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public requestParamAsInteger = async (request: express.Request, paramName: string): Promise<number> => {
        try {
            const schema = joi.number().integer().required();
            const param = request.params[paramName];
            await schema.validateAsync(param);
            return parseInt(request.params[paramName]);
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public requestParamAsDecimal = async (request: express.Request, paramName: string): Promise<number> => {
        try {
            const schema = joi.number().required();
            const param = request.params[paramName];
            await schema.validateAsync(param);
            return parseFloat(request.params[paramName]);
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateBaseSearchFilters = async(request: express.Request) => {
        try {
            const schema = joi.object({
                createdDateFrom: joi.date().optional(),
                createdDateTo  : joi.date().optional(),
                orderBy        : joi.string().optional(),
                order          : joi.string().allow('ascending', 'descending').optional(),
                pageIndex      : joi.number().integer().sign('positive').optional(),
                itemsPerPage   : joi.number().integer().sign('positive').optional(),
            });
            await schema.validateAsync(request.query);
            return this.getBaseSearchFilters(request);
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    private getBaseSearchFilters = (request: express.Request): any => {
        
        var filters = {};
        const pageIndex: number = request.query.pageIndex != undefined && request.query.pageIndex != null ?
            parseInt(request.query.pageIndex as string, 10) : 0;

        const itemsPerPage: number = request.query.itemsPerPage != undefined && request.query.itemsPerPage != null ?
            parseInt(request.query.itemsPerPage as string, 10) : 25;

        filters['CreatedDateFrom'] = request.query.createdDateFrom ? new Date(request.query.createdDateFrom as string) : null;
        filters['CreatedDateTo']   = request.query.createdDateTo ? new Date(request.query.createdDateTo as string) : null;
        filters['OrderBy']         = request.query.orderBy as string ?? 'CreatedAt';
        filters['Order']           = request.query.order as string ?? 'descending';
        filters['PageIndex']       = pageIndex;
        filters['ItemsPerPage']    = itemsPerPage;

        return filters;
    };
    
}
