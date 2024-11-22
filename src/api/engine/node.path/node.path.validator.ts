import joi from 'joi';
import express from 'express';
import {
    NodePathCreateModel,
    NodePathUpdateModel,
    NodePathSearchFilters
} from '../../../domain.types/engine/node.path.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';

///////////////////////////////////////////////////////////////////////////////////////////////

export class NodePathValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<NodePathCreateModel> => {
        try {
            const node = joi.object({
                Name         : joi.string().max(32).required(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().required(),
                SchemaId     : joi.string().uuid().required(),
            });
            await node.validateAsync(request.body);
            return {
                Name         : request.body.Name,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId,
                SchemaId     : request.body.SchemaId,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<NodePathUpdateModel|undefined> => {
        try {
            const node = joi.object({
                Name         : joi.string().max(32).optional(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().optional(),
                SchemaId     : joi.string().uuid().optional(),
            });
            await node.validateAsync(request.body);
            return {
                Name         : request.body.Name ?? null,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId ?? null,
                SchemaId     : request.body.SchemaId ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request)
        : Promise<NodePathSearchFilters> => {
        try {
            const node = joi.object({
                parentNodeId : joi.string().uuid().optional(),
                schemaId     : joi.string().uuid().optional(),
                name         : joi.string().max(64).optional()
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

    private getSearchFilters = (query): NodePathSearchFilters => {

        var filters = {};

        var name = query.name ? query.name : null;
        if (name != null) {
            filters['Name'] = name;
        }
        var parentNodeId = query.parentNodeId ? query.parentNodeId : null;
        if (parentNodeId != null) {
            filters['ParentNodeId'] = parentNodeId;
        }
        var schemaId = query.schemaId ? query.schemaId : null;
        if (schemaId != null) {
            filters['SchemaId'] = schemaId;
        }

        return filters;
    };

}
