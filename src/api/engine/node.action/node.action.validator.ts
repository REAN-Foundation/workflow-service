import joi from 'joi';
import express from 'express';
import {
    NodeActionCreateModel,
    NodeActionUpdateModel,
    NodeActionSearchFilters
} from '../../../domain.types/engine/node.action.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';
import { ActionType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class NodeActionValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<NodeActionCreateModel> => {
        try {
            const node = joi.object({
                ActionType   : joi.string().valid(...Object.values(ActionType)).required(),
                Name         : joi.string().max(32).required(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().required(),
                Input        : joi.object().required(),
                Output       : joi.object().required(),
            });
            await node.validateAsync(request.body);
            return {
                ActionType   : request.body.ActionType,
                Name         : request.body.Name,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId,
                Input        : request.body.Input,
                Output       : request.body.Output,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<NodeActionUpdateModel|undefined> => {
        try {
            const node = joi.object({
                ActionType   : joi.string().valid(...Object.values(ActionType)).optional(),
                Name         : joi.string().max(32).optional(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().optional(),
                Input        : joi.object().optional(),
                Output       : joi.object().optional(),
            });
            await node.validateAsync(request.body);
            return {
                ActionType   : request.body.ActionType ?? null,
                Name         : request.body.Name ?? null,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId ?? null,
                Input        : request.body.Input ?? null,
                Output       : request.body.Output ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request)
        : Promise<NodeActionSearchFilters> => {
        try {
            const node = joi.object({
                parentNodeId : joi.string().uuid().optional(),
                name         : joi.string().max(64).optional(),
                actionType   : joi.string().valid(...Object.values(ActionType)).optional(),
            });
            await node.validateAsync(request.query);
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

    private getSearchFilters = (query): NodeActionSearchFilters => {

        var filters = {};

        var name = query.name ? query.name : null;
        if (name != null) {
            filters['Name'] = name;
        }
        var parentNodeId = query.parentNodeId ? query.parentNodeId : null;
        if (parentNodeId != null) {
            filters['ParentNodeId'] = parentNodeId;
        }
        var actionType = query.actionType ? query.actionType : null;
        if (actionType != null) {
            filters['ActionType'] = actionType;
        }

        return filters;
    };

}
