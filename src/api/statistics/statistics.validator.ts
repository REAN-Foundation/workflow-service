import joi from 'joi';
import express from 'express';
import { ErrorHandler } from '../../common/handlers/error.handler';
import BaseValidator from '../base.validator';
import {
    DailySchemaInstanceTrendFilters,
    SchemaInstanceListFilters,
    StatisticsBaseFilters,
    WorkflowDefinitionStatsFilters,
} from '../../domain.types/statistics/statistics.types';

///////////////////////////////////////////////////////////////////////////////////////////////

export class StatisticsValidator extends BaseValidator {

    public validateStatsFilters = async (request: express.Request): Promise<StatisticsBaseFilters> => {
        try {
            const schema = joi.object({
                tenantId        : joi.string().uuid().required(),
                createdDateFrom : joi.date().iso().optional(),
                createdDateTo   : joi.date().iso().min(joi.ref('createdDateFrom')).optional(),
            });
            await schema.validateAsync(request.query);
            return {
                TenantId        : request.query.tenantId as string,
                CreatedDateFrom : request.query.createdDateFrom ? new Date(request.query.createdDateFrom as string) : null,
                CreatedDateTo   : request.query.createdDateTo ? new Date(request.query.createdDateTo as string) : null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateWorkflowDefinitionStatsFilters = async (request: express.Request): Promise<WorkflowDefinitionStatsFilters> => {
        try {
            const schema = joi.object({
                tenantId        : joi.string().uuid().required(),
                schemaId        : joi.string().uuid().optional(),
                createdDateFrom : joi.date().iso().optional(),
                createdDateTo   : joi.date().iso().min(joi.ref('createdDateFrom')).optional(),
            });
            await schema.validateAsync(request.query);
            return {
                TenantId        : request.query.tenantId as string,
                SchemaId        : request.query.schemaId ? (request.query.schemaId as string) : null,
                CreatedDateFrom : request.query.createdDateFrom ? new Date(request.query.createdDateFrom as string) : null,
                CreatedDateTo   : request.query.createdDateTo ? new Date(request.query.createdDateTo as string) : null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateDailyTrendFilters = async (request: express.Request): Promise<DailySchemaInstanceTrendFilters> => {
        try {
            const schema = joi.object({
                tenantId        : joi.string().uuid().required(),
                schemaId        : joi.string().uuid().optional(),
                createdDateFrom : joi.date().iso().optional(),
                createdDateTo   : joi.date().iso().min(joi.ref('createdDateFrom')).optional(),
            });
            await schema.validateAsync(request.query);
            return {
                TenantId        : request.query.tenantId as string,
                SchemaId        : request.query.schemaId ? (request.query.schemaId as string) : null,
                CreatedDateFrom : request.query.createdDateFrom ? new Date(request.query.createdDateFrom as string) : null,
                CreatedDateTo   : request.query.createdDateTo ? new Date(request.query.createdDateTo as string) : null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSchemaInstanceListFilters = async (request: express.Request): Promise<SchemaInstanceListFilters> => {
        try {
            const schema = joi.object({
                tenantId        : joi.string().uuid().required(),
                schemaId        : joi.string().uuid().required(),
                createdDateFrom : joi.date().iso().optional(),
                createdDateTo   : joi.date().iso().min(joi.ref('createdDateFrom')).optional(),
                pageIndex       : joi.number().integer().min(0).optional(),
                itemsPerPage    : joi.number().integer().min(1).max(100).optional(),
            });
            await schema.validateAsync(request.query);
            return {
                TenantId        : request.query.tenantId as string,
                SchemaId        : request.query.schemaId ? (request.query.schemaId as string) : null,
                CreatedDateFrom : request.query.createdDateFrom ? new Date(request.query.createdDateFrom as string) : null,
                CreatedDateTo   : request.query.createdDateTo ? new Date(request.query.createdDateTo as string) : null,
                PageIndex       : request.query.pageIndex ? parseInt(request.query.pageIndex as string, 10) : 0,
                ItemsPerPage    : request.query.itemsPerPage ? parseInt(request.query.itemsPerPage as string, 10) : 25,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

}
