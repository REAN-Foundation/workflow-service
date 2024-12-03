import joi from 'joi';
import express from 'express';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';
import { ConditionCreateModel, ConditionUpdateModel, ConditionSearchFilters } from '../../../domain.types/engine/condition.types';
import { CompositionOperatorType, InputSourceType, LogicalOperatorType, OperandDataType, OperatorType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class ConditionValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<ConditionCreateModel> => {
        try {
            const condition = joi.object({
                Name                    : joi.string().max(32).required(),
                Description             : joi.string().max(256).optional(),
                ParentRuleId            : joi.string().uuid().required(),
                ParentConditionId       : joi.string().allow(null).uuid().required(),
                NodePathId              : joi.string().allow(null).uuid().optional(),
                ParentNodeId            : joi.string().allow(null).uuid().optional(),
                OperatorType            : joi.string().valid(...Object.values(OperatorType)).optional(),
                LogicalOperatorType     : joi.string().valid(...Object.values(LogicalOperatorType)).optional(),
                CompositionOperatorType : joi.string().valid(...Object.values(CompositionOperatorType)).optional(),
                FirstOperand            : joi.object({
                    DataType : joi.string().valid(...Object.values(OperandDataType)).required(),
                    Name     : joi.string().max(32).optional(),
                    Value    : joi.any().allow(null).optional(),
                    Source   : joi.string().allow(null).valid(...Object.values(InputSourceType)).optional(),
                    Key      : joi.string().allow(null).max(256).optional(),
                }).optional(),
                SecondOperand : joi.object({
                    DataType : joi.string().valid(...Object.values(OperandDataType)).required(),
                    Name     : joi.string().max(32).optional(),
                    Value    : joi.any().allow(null).optional(),
                    Source   : joi.string().allow(null).valid(...Object.values(InputSourceType)).optional(),
                    Key      : joi.string().allow(null).max(256).optional(),
                }).optional(),
                ThirdOperand : joi.object({
                    DataType : joi.string().valid(...Object.values(OperandDataType)).required(),
                    Name     : joi.string().max(32).optional(),
                    Value    : joi.any().allow(null).optional(),
                    Source   : joi.string().allow(null).valid(...Object.values(InputSourceType)).optional(),
                    Key      : joi.string().allow(null).max(256).optional(),
                }).optional(),
            });
            await condition.validateAsync(request.body);
            return {
                Name                    : request.body.Name,
                Description             : request.body.Description ?? null,
                ParentRuleId            : request.body.ParentRuleId,
                ParentConditionId       : request.body.ParentConditionId,
                NodePathId              : request.body.NodePathId ?? null,
                ParentNodeId            : request.body.ParentNodeId ?? null,
                OperatorType            : request.body.OperatorType ?? OperatorType.Logical,
                LogicalOperatorType     : request.body.LogicalOperatorType ?? LogicalOperatorType.Equal,
                CompositionOperatorType : request.body.CompositionOperatorType ?? CompositionOperatorType.And,
                FirstOperand            : request.body.FirstOperand ?? null,
                SecondOperand           : request.body.SecondOperand ?? null,
                ThirdOperand            : request.body.ThirdOperand ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request)
        : Promise<ConditionUpdateModel> => {
        try {
            const condition = joi.object({
                Name                    : joi.string().max(32).optional(),
                Description             : joi.string().max(256).optional(),
                ParentRuleId            : joi.string().uuid().optional(),
                ParentConditionId       : joi.string().allow(null).uuid().optional(),
                NodePathId              : joi.string().allow(null).uuid().optional(),
                ParentNodeId            : joi.string().allow(null).uuid().optional(),
                OperatorType            : joi.string().valid(...Object.values(OperatorType)).optional(),
                LogicalOperatorType     : joi.string().valid(...Object.values(LogicalOperatorType)).optional(),
                CompositionOperatorType : joi.string().valid(...Object.values(CompositionOperatorType)).optional(),
                FirstOperand            : joi.object({
                    DataType : joi.string().valid(...Object.values(OperandDataType)).required(),
                    Name     : joi.string().max(32).optional(),
                    Value    : joi.any().allow(null).optional(),
                    Source   : joi.string().allow(null).valid(...Object.values(InputSourceType)).optional(),
                    Key      : joi.string().allow(null).max(256).optional(),
                }).optional(),
                SecondOperand : joi.object({
                    DataType : joi.string().valid(...Object.values(OperandDataType)).required(),
                    Name     : joi.string().max(32).optional(),
                    Value    : joi.any().allow(null).optional(),
                    Source   : joi.string().allow(null).valid(...Object.values(InputSourceType)).optional(),
                    Key      : joi.string().allow(null).max(256).optional(),
                }).optional(),
                ThirdOperand : joi.object({
                    DataType : joi.string().valid(...Object.values(OperandDataType)).required(),
                    Name     : joi.string().max(32).optional(),
                    Value    : joi.any().allow(null).optional(),
                    Source   : joi.string().allow(null).valid(...Object.values(InputSourceType)).optional(),
                    Key      : joi.string().allow(null).max(256).optional(),
                }).optional(),
            });
            await condition.validateAsync(request.body);
            return {
                Name                    : request.body.Name ?? null,
                Description             : request.body.Description ?? null,
                ParentRuleId            : request.body.ParentRuleId ?? null,
                ParentConditionId       : request.body.ParentConditionId ?? null,
                NodePathId              : request.body.NodePathId ?? null,
                ParentNodeId            : request.body.ParentNodeId ?? null,
                OperatorType            : request.body.OperatorType ?? null,
                LogicalOperatorType     : request.body.LogicalOperatorType ?? null,
                CompositionOperatorType : request.body.CompositionOperatorType ?? null,
                FirstOperand            : request.body.FirstOperand ?? null,
                SecondOperand           : request.body.SecondOperand ?? null,
                ThirdOperand            : request.body.ThirdOperand ?? null,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request)
        : Promise<ConditionSearchFilters> => {
        try {
            const condition = joi.object({
                parentConditionId : joi.string().uuid().optional(),
                parentRuleId      : joi.string().uuid().optional(),
                name              : joi.string().max(64).optional(),
            });
            await condition.validateAsync(request.query);
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

    private getSearchFilters = (query): ConditionSearchFilters => {

        var filters = {};

        var name = query.name ? query.name : null;
        if (name != null) {
            filters['Name'] = name;
        }
        var parentConditionId = query.parentConditionId ? query.parentConditionId : null;
        if (parentConditionId != null) {
            filters['ParentConditionId'] = parentConditionId;
        }
        var parentRuleId = query.parentRuleId ? query.parentRuleId : null;
        if (parentRuleId != null) {
            filters['ParentRuleId'] = parentRuleId;
        }
        return filters;
    };

}
