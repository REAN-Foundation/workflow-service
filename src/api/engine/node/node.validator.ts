import joi from 'joi';
import express from 'express';
import {
    NodeCreateModel,
    NodeUpdateModel,
    NodeSearchFilters,
    QuestionNodeCreateModel,
    YesNoNodeCreateModel
} from '../../../domain.types/engine/node.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';
import { NodeType, ActionType, QuestionResponseType, ParamType, InputSourceType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class NodeValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<NodeCreateModel> => {
        try {
            const node = joi.object({
                Type         : joi.string().valid(...Object.values(NodeType)).required(),
                Name         : joi.string().max(64).required(),
                Description  : joi.string().max(512).optional(),
                ParentNodeId : joi.string().allow(null).uuid().required(),
                SchemaId     : joi.string().uuid().required(),
                Actions      : joi.array().items(joi.object({
                    Type         : joi.string().valid(...Object.values(ActionType)).required(),
                    Sequence     : joi.number().integer().optional(),
                    IsPathAction : joi.boolean().optional(),
                    Name         : joi.string().max(64).required(),
                    Description  : joi.string().max(512).optional(),
                    RawInput     : joi.any().optional(),
                    Input        : joi.object().optional(),
                    Output       : joi.object().optional(),
                })).optional(),
                RuleId       : joi.string().uuid().optional(),
                DelaySeconds : joi.number().integer().optional(),
                RawData      : joi.object().allow(null).optional(),
                Input        : joi.object({
                    Params : joi.array().items(joi.object({
                        Name        : joi.string().max(128).required(),
                        Description : joi.string().max(512).optional(),
                        ActionType  : joi.string().valid(...Object.values(ActionType)).optional(),
                        Type        : joi.string().valid(...Object.values(ParamType)).required(),
                        Value       : joi.any().allow(null).required(),
                        Source      : joi.string().valid(...Object.values(InputSourceType)).optional(),
                        Key         : joi.string().max(256).optional(),
                        Required    : joi.boolean().optional(),
                    })).required(),
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
                RuleId       : request.body.RuleId ?? null,
                RawData      : request.body.RawData ?? null,
                Input        : request.body.Input ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateCreateYesNoNodeRequest = async (request: express.Request)
    : Promise<YesNoNodeCreateModel> => {
        try {
            const node = joi.object({
                Type         : joi.string().valid(...Object.values(NodeType)).required(),
                Name         : joi.string().max(64).required(),
                Description  : joi.string().max(512).optional(),
                ParentNodeId : joi.string().uuid().required(),
                SchemaId     : joi.string().uuid().required(),
                Actions      : joi.array().items(joi.object({
                    Type         : joi.string().valid(...Object.values(ActionType)).required(),
                    Sequence     : joi.number().integer().optional(),
                    IsPathAction : joi.boolean().optional(),
                    Name         : joi.string().max(64).required(),
                    Description  : joi.string().max(512).optional(),
                    RawInput     : joi.any().optional(),
                    Input        : joi.object().optional(),
                    Output       : joi.object().optional(),
                })).optional(),
                RuleId       : joi.string().uuid().optional(),
                DelaySeconds : joi.number().integer().optional(),
                RawData      : joi.object().allow(null).optional(),
                Input        : joi.object({
                    Params : joi.array().items(joi.object({
                        Type     : joi.string().valid(...Object.values(ParamType)).required(),
                        Value    : joi.any().allow(null).required(),
                        Source   : joi.string().valid(...Object.values(InputSourceType)).optional(),
                        Key      : joi.string().max(256).optional(),
                        Required : joi.boolean().optional(),
                    })).required(),
                }).optional(),
                YesAction : joi.object({
                    Type         : joi.string().valid(...Object.values(ActionType)).required(),
                    Name         : joi.string().max(64).required(),
                    IsPathAction : joi.boolean().optional(),
                    Description  : joi.string().max(512).optional(),
                    RawInput     : joi.any().optional(),
                    Input        : joi.object().allow(null).optional(),
                    Output       : joi.object().allow(null).optional(),
                }).required(),
                NoAction : joi.object({
                    Type         : joi.string().valid(...Object.values(ActionType)).required(),
                    Name         : joi.string().max(64).required(),
                    IsPathAction : joi.boolean().optional(),
                    Description  : joi.string().max(512).optional(),
                    RawInput     : joi.any().optional(),
                    Input        : joi.object().allow(null).optional(),
                    Output       : joi.object().allow(null).optional(),
                }).required(),
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
                RuleId       : request.body.RuleId ?? null,
                RawData      : request.body.RawData ?? null,
                Input        : request.body.Input ?? null,
                YesAction    : request.body.YesAction ?? null,
                NoAction     : request.body.NoAction ?? null,
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
                Name         : joi.string().max(64).required(),
                Description  : joi.string().max(512).optional(),
                ParentNodeId : joi.string().uuid().required(),
                SchemaId     : joi.string().uuid().required(),
                Actions      : joi.array().items(joi.object({
                    Type         : joi.string().valid(...Object.values(ActionType)).required(),
                    Sequence     : joi.number().integer().optional(),
                    IsPathAction : joi.boolean().optional(),
                    Name         : joi.string().max(64).required(),
                    Description  : joi.string().max(512).optional(),
                    RawInput     : joi.any().optional(),
                    Input        : joi.object().optional(),
                    Output       : joi.object().optional(),
                })).optional(),
                QuestionText : joi.string().max(512).required(),
                ResponseType : joi.string().valid(...Object.values(QuestionResponseType)).required(),
                Options      : joi.array().items(joi.object({
                    Text     : joi.string().allow(null).max(512).required(),
                    ImageUrl : joi.string().allow(null).max(512).optional(),
                    Sequence : joi.number().integer().allow(null).max(10).optional(),
                    Metadata : joi.array().allow(null).items(joi.object({
                        Key   : joi.string().max(64).required(),
                        Value : joi.any().required(),
                    })).optional(),
                })).optional(),
                RuleId       : joi.string().uuid().optional(),
                DelaySeconds : joi.number().integer().optional(),
                RawData      : joi.object().allow(null).optional(),
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type,
                Name         : request.body.Name,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId,
                SchemaId     : request.body.SchemaId,
                Actions      : request.body.Actions ?? null,
                QuestionText : request.body.QuestionText ?? null,
                ResponseType : request.body.ResponseType ?? null,
                Options      : request.body.Options ?? [],
                DelaySeconds : request.body.ExecutionDelaySeconds ?? null,
                RuleId       : request.body.ExecutionRuleId ?? null,
                RawData      : request.body.RawData ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<NodeUpdateModel|undefined> => {
        try {
            const node = joi.object({
                Type                  : joi.string().valid(...Object.values(NodeType)).optional(),
                Name                  : joi.string().max(64).optional(),
                Description           : joi.string().max(512).optional(),
                ParentNodeId          : joi.string().uuid().optional(),
                SchemaId              : joi.string().uuid().optional(),
                ExecutionRuleId       : joi.string().uuid().optional(),
                ExecutionDelaySeconds : joi.number().integer().optional(),
                RawData               : joi.object().allow(null).optional(),
            });
            await node.validateAsync(request.body);
            return {
                Type         : request.body.Type ?? null,
                Name         : request.body.Name ?? null,
                Description  : request.body.Description ?? null,
                ParentNodeId : request.body.ParentNodeId ?? null,
                SchemaId     : request.body.SchemaId ?? null,
                RuleId       : request.body.RuleId ?? null,
                DelaySeconds : request.body.DelaySeconds ?? null,
                RawData      : request.body.RawData ?? null,
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
