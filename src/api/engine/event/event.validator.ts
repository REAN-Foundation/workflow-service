import joi from 'joi';
import express from 'express';
import { MessageEventCreateModel, EventSearchFilters } from '../../../domain.types/engine/event.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';

///////////////////////////////////////////////////////////////////////////////////////////////

export class EventValidator extends BaseValidator {

    public validateCreateMessageEventRequest = async (request: express.Request)
        : Promise<MessageEventCreateModel> => {
        try {
            const event = joi.object({
                TenantId         : joi.string().uuid().required(),
                EventType        : joi.string().required(),
                ReferenceId      : joi.string().uuid().required(),
                SchemaInstanceId : joi.string().uuid().optional(),
                SchemaName       : joi.string().optional(),
                SchemaId         : joi.string().uuid().optional(),
                TimeStamp        : joi.date().required(),
                Payload          : joi.object({
                    QuestionOptions      : joi.array().items(joi.string()).optional(),
                    ChosenOption         : joi.string().optional(),
                    ChosenOptionSequence : joi.number().optional(),
                    TextMessage          : joi.string().required(),
                    Location             : joi.object({
                        Latitude  : joi.number().required(),
                        Longitude : joi.number().required(),
                    }).optional(),
                    Images            : joi.array().items(joi.string()).optional(),
                    Videos            : joi.array().items(joi.string()).optional(),
                    Audios            : joi.array().items(joi.string()).optional(),
                    PreviousMessageId : joi.string().uuid().optional(),
                    PreviousNodeId    : joi.string().uuid().optional(),
                }).required(),
            });
            await event.validateAsync(request.body);
            const model: MessageEventCreateModel = {
                TenantId         : request.body.TenantId,
                EventType        : request.body.EventType,
                ReferenceId      : request.body.ReferenceId ?? null,
                SchemaInstanceId : request.body.SchemaInstanceId ?? null,
                SchemaName       : request.body.SchemaName ?? null,
                SchemaId         : request.body.SchemaId ?? null,
                TimeStamp        : request.body.TimeStamp,
                Payload          : {
                    QuestionOptions      : request.body.Payload.QuestionOptions ?? null,
                    ChosenOption         : request.body.Payload.ChosenOption ?? null,
                    ChosenOptionSequence : request.body.Payload.ChosenOptionSequence ?? null,
                    TextMessage          : request.body.Payload.TextMessage,
                    Location             : request.body.Payload.Location,
                    Images               : request.body.Payload.Images ?? null,
                    Videos               : request.body.Payload.Videos ?? null,
                    Audios               : request.body.Payload.Audios ?? null,
                    PreviousMessageId    : request.body.Payload.PreviousMessageId ?? null,
                    PreviousNodeId       : request.body.Payload.PreviousNodeId ?? null,
                },
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

        var tenantId = query.tenantId ? query.tenantId : null;
        if (tenantId != null) {
            filters['TenantId'] = tenantId;
        }
        var EventType = query.EventType ? query.EventType : null;
        if (EventType != null) {
            filters['EventType'] = EventType;
        }
        var ReferenceId = query.ReferenceId ? query.ReferenceId : null;
        if (ReferenceId != null) {
            filters['ReferenceId'] = ReferenceId;
        }
        var SchemaInstanceId = query.SchemaInstanceId ? query.SchemaInstanceId : null;
        if (SchemaInstanceId != null) {
            filters['SchemaInstanceId'] = SchemaInstanceId;
        }
        var SchemaName = query.SchemaName ? query.SchemaName : null;
        if (SchemaName != null) {
            filters['SchemaName'] = SchemaName;
        }
        return filters as EventSearchFilters;
    };

}
