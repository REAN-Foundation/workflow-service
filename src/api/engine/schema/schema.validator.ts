import joi from 'joi';
import express from 'express';
import { SchemaCreateModel, SchemaUpdateModel, SchemaSearchFilters } from '../../../domain.types/engine/schema.domain.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';
import { ActionType, InputSourceType, NodeType, OutputDestinationType, ParamType, SchemaType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class SchemaValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request): Promise<SchemaCreateModel> => {
        try {
            const schema = joi.object({
                TenantId           : joi.string().uuid().required(),
                TenantCode         : joi.string().required(),
                Name               : joi.string().max(64).required(),
                Type               : joi.string().valid(...Object.values(SchemaType)).required(),
                Description        : joi.string().max(512).optional(),
                ParentSchemaId     : joi.string().uuid().optional(),
                ExecuteImmediately : joi.boolean().optional(),
                ContextParams      : joi.object({
                    Name   : joi.string().max(128).required(),
                    Params : joi.array().items(joi.object({
                        Name                : joi.string().max(128).required(),
                        Type                : joi.string().valid(...Object.values(ParamType)).required(),
                        Description         : joi.string().max(512).optional(),
                        Value               : joi.any().allow(null).optional(),
                        Key                 : joi.string().max(256).optional(),
                        Required            : joi.boolean().optional(),
                        ComparisonThreshold : joi.number().allow(null).optional(),
                        ComparisonUnit      : joi.string().allow(null).optional(),
                    })).required()
                }).optional(),
                RootNode : joi.object({
                    Type        : joi.string().valid(...Object.values(NodeType)).required(),
                    Name        : joi.string().max(128).required(),
                    Description : joi.string().max(512).optional(),
                    Actions     : joi.array().items({
                        Type  : joi.string().valid(...Object.values(ActionType)).required(),
                        Name  : joi.string().max(128).required(),
                        Input : joi.object({
                            Params : joi.array().items(joi.object({
                                Type   : joi.string().valid(...Object.values(ParamType)).required(),
                                Value  : joi.any().allow(null).required(),
                                Source : joi.string().valid(...Object.values(InputSourceType)).optional(),
                                Key    : joi.string().max(256).optional(),
                            })).required(),
                        }).required(),
                        Output : joi.object({
                            Params : joi.array().items(joi.object({
                                Type        : joi.string().valid(...Object.values(ParamType)).required(),
                                Value       : joi.any().allow(null).required(),
                                Destination : joi.string().valid(...Object.values(OutputDestinationType)).optional(),
                                Key         : joi.string().max(256).optional(),
                            })).required(),
                        }).optional(),
                    }).optional()
                }).optional()
            });

            await schema.validateAsync(request.body);

            return {
                TenantId           : request.body.TenantId,
                TenantCode         : request.body.TenantCode,
                ParentSchemaId     : request.body.ParentSchemaId ?? null,
                Name               : request.body.Name,
                Description        : request.body.Description ?? null,
                Type               : request.body.Type,
                RootNode           : request.body.RootNode ?? null,
                ExecuteImmediately : request.body.ExecuteImmediately ?? false,
                ContextParams      : request.body.ContextParams ?? null,
            };

        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<SchemaUpdateModel|undefined> => {
        try {
            const schema = joi.object({
                Name               : joi.string().max(64).optional(),
                Type               : joi.string().valid(...Object.values(SchemaType)).optional(),
                Description        : joi.string().max(512).optional(),
                ParentSchemaId     : joi.string().uuid().optional(),
                ExecuteImmediately : joi.boolean().optional(),
                ContextParams      : joi.object({
                    Name   : joi.string().max(128).required(),
                    Params : joi.array().items(joi.object({
                        Name                : joi.string().max(128).required(),
                        Type                : joi.string().valid(...Object.values(ParamType)).required(),
                        Description         : joi.string().max(512).optional(),
                        Value               : joi.any().required(),
                        Required            : joi.boolean().optional(),
                        ComparisonThreshold : joi.number().allow(null).optional(),
                        ComparisonUnit      : joi.string().allow(null).optional(),
                    })).required()
                }).optional(),
            });
            await schema.validateAsync(request.body);
            return {
                Name               : request.body.Name ?? null,
                Type               : request.body.Type ?? null,
                ParentSchemaId     : request.body.ParentSchemaId ?? null,
                Description        : request.body.Description ?? null,
                ExecuteImmediately : request.body.ExecuteImmediately ?? null,
                ContextParams      : request.body.ContextParams ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request): Promise<SchemaSearchFilters> => {
        try {
            const schema = joi.object({
                tenantId       : joi.string().uuid().optional(),
                name           : joi.string().max(64).optional(),
                parentSchemaId : joi.string().uuid().optional(),
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

    private getSearchFilters = (query): SchemaSearchFilters => {

        var filters = {};

        var name = query.name ? query.name : null;
        if (name != null) {
            filters['Name'] = name;
        }
        var tenantId = query.tenantId ? query.tenantId : null;
        if (tenantId != null) {
            filters['TenantId'] = tenantId;
        }
        var parentSchemaId = query.parentSchemaId ? query.parentSchemaId : null;
        if (parentSchemaId != null) {
            filters['ParentSchemaId'] = parentSchemaId;
        }

        return filters;
    };

}
