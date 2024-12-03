import joi from 'joi';
import express from 'express';
import { RuleCreateModel, RuleUpdateModel, RuleSearchFilters } from '../../../domain.types/engine/rule.domain.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';

///////////////////////////////////////////////////////////////////////////////////////////////

export class RuleValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<RuleCreateModel> => {
        try {
            const rule = joi.object({
                Name         : joi.string().max(64).required(),
                Description  : joi.string().max(512).optional(),
                ParentNodeId : joi.string().uuid().required(),
                SchemaId     : joi.string().uuid().required(),
                ConditionId  : joi.string().uuid().required(),
            });
            await rule.validateAsync(request.body);
            return {
                Name         : request.body.Name,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId,
                SchemaId     : request.body.SchemaId,
                ConditionId  : request.body.ConditionId,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<RuleUpdateModel> => {
        try {
            const rule = joi.object({
                Name         : joi.string().max(64).optional(),
                Description  : joi.string().max(512).optional(),
                ParentNodeId : joi.string().uuid().optional(),
                SchemaId     : joi.string().uuid().optional(),
                ConditionId  : joi.string().uuid().optional(),
            });
            await rule.validateAsync(request.body);
            return {
                Name         : request.body.Name ?? null,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId ?? null,
                SchemaId     : request.body.SchemaId ?? null,
                ConditionId  : request.body.ConditionId ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request): Promise<RuleSearchFilters> => {
        try {
            const rule = joi.object({
                parentNodeId : joi.string().uuid().optional(),
                conditionId  : joi.string().uuid().optional(),
                name         : joi.string().max(64).optional(),
            });
            await rule.validateAsync(request.query);
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

    private getSearchFilters = (query): RuleSearchFilters => {

        var filters = {};

        var name = query.name ? query.name : null;
        if (name != null) {
            filters['Name'] = name;
        }
        var parentNodeId = query.parentNodeId ? query.parentNodeId : null;
        if (parentNodeId != null) {
            filters['ParentNodeId'] = parentNodeId;
        }
        var conditionId = query.conditionId ? query.conditionId : null;
        if (conditionId != null) {
            filters['ConditionId'] = conditionId;
        }
        return filters;
    };

}
