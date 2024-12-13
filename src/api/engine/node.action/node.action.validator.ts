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
                Type         : joi.string().valid(...Object.values(ActionType)).required(),
                Sequence     : joi.number().integer().min(0).optional(),
                IsPathAction : joi.boolean().optional(),
                Name         : joi.string().max(64).required(),
                Description  : joi.string().max(512).optional(),
                ParentNodeId : joi.string().uuid().required(),
                Input        : joi.object().required(),
                Output       : joi.object().optional(),
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type,
                Name         : request.body.Name,
                IsPathAction : request.body.IsPathAction ?? false,
                Sequence     : request.body.Sequence ?? 0,
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
                Type         : joi.string().valid(...Object.values(ActionType)).optional(),
                Name         : joi.string().max(64).optional(),
                IsPathAction : joi.boolean().optional(),
                Description  : joi.string().max(512).optional(),
                ParentNodeId : joi.string().uuid().optional(),
                Input        : joi.object().optional(),
                Output       : joi.object().optional(),
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type ?? null,
                Name         : request.body.Name ?? null,
                IsPathAction : request.body.IsPathAction ?? null,
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
                type         : joi.string().valid(...Object.values(ActionType)).optional(),
                isPathAction : joi.boolean().optional(),
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
        var type = query.type ? query.type : null;
        if (type != null) {
            filters['Type'] = type;
        }
        var isPathAction = query.isPathAction ? query.isPathAction : null;
        if (isPathAction != null) {
            filters['IsPathAction'] = isPathAction;
        }

        return filters;
    };

}
