import joi from 'joi';
import express from 'express';
import {
    NodeCreateModel,
    NodeUpdateModel,
    NodeSearchFilters,
    QuestionNodeCreateModel,
    DelayedActionNodeCreateModel
} from '../../../domain.types/engine/node.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';
import { NodeType, ActionType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class NodeValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<NodeCreateModel> => {
        try {
            const node = joi.object({
                Type         : joi.string().valid(...Object.values(NodeType)).required(),
                Name         : joi.string().max(32).required(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().required(),
                SchemaId     : joi.string().uuid().required(),
                Actions      : joi.array().items(joi.object({
                    ActionType  : joi.string().valid(...Object.values(ActionType)).required(),
                    Name        : joi.string().max(32).required(),
                    Description : joi.string().max(256).optional(),
                    RawInput    : joi.any().optional(),
                    Input       : joi.object().optional(),
                })).optional()
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type,
                Name         : request.body.Name,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId,
                SchemaId     : request.body.SchemaId,
                Actions      : request.body.Actions ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateCreateQuestionNodeRequest = async (request: express.Request)
    : Promise<QuestionNodeCreateModel> => {
        try {
            const node = joi.object({
                Type         : joi.string().valid(...Object.values(NodeType)).required(),
                Name         : joi.string().max(32).required(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().required(),
                SchemaId     : joi.string().uuid().required(),
                Actions      : joi.array().items(joi.object({
                    ActionType  : joi.string().valid(...Object.values(ActionType)).required(),
                    Name        : joi.string().max(32).required(),
                    Description : joi.string().max(256).optional(),
                    RawInput    : joi.any().optional(),
                    Input       : joi.object().optional(),
                })).optional(),
                Question : joi.string().max(512).required(),
                Options  : joi.array().items(joi.object({
                    Text     : joi.string().max(512).required(),
                    ImageUrl : joi.string().max(512).optional(),
                    Sequence : joi.number().integer().max(10).optional(),
                    Metadata : joi.string().max(1024).optional(),
                })).optional(),
                // Paths : joi.array().items(joi.object({
                //     Name     : joi.string().max(512).required(),
                //     Code : joi.string().max(16).optional(),
                //     Sequence : joi.number().integer().max(10).optional(),
                //     Metadata : joi.string().max(1024).optional(),
                // })).optional(),
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type,
                Name         : request.body.Name,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId,
                SchemaId     : request.body.SchemaId,
                Actions      : request.body.Actions ?? null,
                Question     : request.body.Question ?? null,
                Options      : request.body.Options ?? [],
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateCreateDelayedActionNodeRequest = async (request: express.Request)
    : Promise<DelayedActionNodeCreateModel> => {
        try {
            const MAX_DELAY_SECONDS = 60 * 60 * 24 * 35;
            const node = joi.object({
                Type         : joi.string().valid(...Object.values(NodeType)).required(),
                Name         : joi.string().max(32).required(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().required(),
                SchemaId     : joi.string().uuid().required(),
                Actions      : joi.array().items(joi.object({
                    ActionType  : joi.string().valid(...Object.values(ActionType)).required(),
                    Name        : joi.string().max(32).required(),
                    Description : joi.string().max(256).optional(),
                    RawInput    : joi.any().optional(),
                    Input       : joi.object().optional(),
                })).optional(),
                DelaySeconds : joi.number().integer().max(MAX_DELAY_SECONDS).required(),
                Rule         : joi.object({
                    Name        : joi.string().max(32).required(),
                    Description : joi.string().max(256).optional(),
                }).optional(),
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type,
                Name         : request.body.Name,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId,
                SchemaId     : request.body.SchemaId,
                Actions      : request.body.Actions ?? null,
                DelaySeconds : request.body.DelaySeconds ?? null,
                Rule         : request.body.Rule ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<NodeUpdateModel|undefined> => {
        try {
            const node = joi.object({
                Type         : joi.string().valid(...Object.values(NodeType)).optional(),
                Name         : joi.string().max(32).optional(),
                Description  : joi.string().max(256).optional(),
                ParentNodeId : joi.string().uuid().optional(),
                SchemaId     : joi.string().uuid().optional(),
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type ?? null,
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
        : Promise<NodeSearchFilters> => {
        try {
            const node = joi.object({
                type         : joi.string().valid(...Object.values(NodeType)).optional(),
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

    private getSearchFilters = (query): NodeSearchFilters => {

        var filters = {};

        var type = query.type ? query.type : null;
        if (type != null) {
            filters['Type'] = type;
        }
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
