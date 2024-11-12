import joi from 'joi';
import express from 'express';
import { EventCreateModel, EventSearchFilters } from '../../../domain.types/engine/event.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';

///////////////////////////////////////////////////////////////////////////////////////////////

export class EventValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<EventCreateModel> => {
        try {
            const event = joi.object({
                TypeId      : joi.string().uuid().required(),
                ReferenceId : joi.string().uuid().required(),
                Payload     : joi.any().required(),
            });
            await event.validateAsync(request.body);
            const model: EventCreateModel = {
                EventType   : request.body.EventType,
                ReferenceId : request.body.ReferenceId,
                Payload     : request.body.Payload,
            };
            return model;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request)
        : Promise<EventSearchFilters> => {
        try {
            const condition = joi.object({
                typeId      : joi.string().uuid().optional(),
                referenceId : joi.string().uuid().optional(),
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

    private getSearchFilters = (query): EventSearchFilters => {

        var filters = {};

        var typeId = query.typeId ? query.typeId : null;
        if (typeId != null) {
            filters['TypeId'] = typeId;
        }
        var ReferenceId = query.ReferenceId ? query.ReferenceId : null;
        if (ReferenceId != null) {
            filters['ReferenceId'] = ReferenceId;
        }
        return filters;
    };

}
