import joi from 'joi';
import express from 'express';
import {
    SchemaInstanceCreateModel,
    SchemaInstanceUpdateModel,
    SchemaInstanceSearchFilters
} from '../../../domain.types/engine/schema.instance.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';
import { ParamType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class SchemaInstanceValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request): Promise<SchemaInstanceCreateModel> => {
        try {
            const schema = joi.object({
                SchemaId      : joi.string().uuid().required(),
                ContextParams : joi.object({
                    Name   : joi.string().max(128).required(),
                    Params : joi.array().items(joi.object({
                        Name        : joi.string().max(128).required(),
                        Type        : joi.string().valid(...Object.values(ParamType)).required(),
                        Description : joi.string().max(512).optional(),
                        Value       : joi.any().required(),
                    })).required()
                }).optional(),
            });
            await schema.validateAsync(request.body);
            return {
                TenantId      : request.body.TenantId,
                SchemaId      : request.body.SchemaId,
                ContextParams : request.body.ContextParams
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<SchemaInstanceUpdateModel|undefined> => {
        try {
            const schema = joi.object({
                ContextParams : joi.object({
                    Name   : joi.string().max(128).required(),
                    Params : joi.array().items(joi.object({
                        Name        : joi.string().max(128).required(),
                        Type        : joi.string().valid(...Object.values(ParamType)).required(),
                        Description : joi.string().max(512).optional(),
                        Value       : joi.any().required(),
                    })).required()
                }).optional(),
            });
            await schema.validateAsync(request.body);
            return {
                ContextParams : request.body.ContextParams ?? null
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request): Promise<SchemaInstanceSearchFilters> => {
        try {
            const schema = joi.object({
                schemaId  : joi.string().uuid().optional(),
                contextId : joi.string().uuid().optional(),
            });
            await schema.validateAsync(request.query);
            const filters = this.getSearchFilters(request.query);
            const baseFilters = await this.validateBaseSearchFilters(request);
            return {
                ...baseFilters,
                ...filters
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    private getSearchFilters = (query): SchemaInstanceSearchFilters => {

        var filters = {};

        var schemaId = query.schemaId ? query.schemaId : null;
        if (schemaId != null) {
            filters['SchemaId'] = schemaId;
        }
        var contextId = query.contextId ? query.contextId : null;
        if (contextId != null) {
            filters['ContextId'] = contextId;
        }

        return filters;
    };

}
