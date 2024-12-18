import joi from 'joi';
import express from 'express';
import { EventCreateModel, EventSearchFilters } from '../../../domain.types/engine/event.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';
import { MessageChannelType, UserMessageType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class EventValidator extends BaseValidator {

    public validateCreateMessageEventRequest = async (request: express.Request)
        : Promise<EventCreateModel> => {
        try {
            const event = joi.object({
                TenantId         : joi.string().uuid().required(),
                EventType        : joi.string().required(),
                SchemaId         : joi.string().uuid().optional(),
                SchemaInstanceId : joi.string().uuid().optional(),
                UserMessage      : joi.object({
                    Phone          : joi.string().required(),
                    MessageType    : joi.string().valid(...Object.values(UserMessageType)).required(),
                    MessageChannel : joi.string().valid(...Object.values(MessageChannelType)).required(),
                    EventTimestamp : joi.date().required(),
                    TextMessage    : joi.string().optional(),
                    ImageUrl       : joi.string().optional(),
                    VideoUrl       : joi.string().optional(),
                    AudioUrl       : joi.string().optional(),
                    Location       : joi.object({
                        Name      : joi.string().optional(),
                        Latitude  : joi.number().required(),
                        Longitude : joi.number().required(),
                    }).optional(),
                    QuestionResponse : joi.object({
                        QuestionId      : joi.string().uuid().optional(),
                        QuestionText    : joi.string().optional(),
                        QuestionOptions : joi.array().items(joi.object({
                            Text     : joi.string().allow(null).max(512).required(),
                            ImageUrl : joi.string().allow(null).max(512).optional(),
                            Sequence : joi.number().integer().allow(null).max(10).optional(),
                            Metadata : joi.string().allow(null).max(1024).optional(),
                        })).optional(),
                        ChosenOption         : joi.string().allow(null).optional(),
                        ChosenOptionSequence : joi.number().integer().allow(null).optional(),
                        PreviousMessageId    : joi.string().allow(null).uuid().optional(),
                        PreviousNodeId       : joi.string().allow(null).uuid().optional(),
                    }).optional(),
                }).optional(),
                EventTimestamp : joi.date().required(),
                Payload        : joi.object().allow(null).optional(),
            });
            await event.validateAsync(request.body);
            const model: EventCreateModel = {
                TenantId         : request.body.TenantId,
                EventType        : request.body.EventType,
                SchemaId         : request.body.SchemaId ?? null,
                SchemaInstanceId : request.body.SchemaInstanceId ?? null,
                UserMessage      : request.body.UserMessage ?? null,
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
                eventType        : joi.string().uuid().optional(),
                tenantId         : joi.string().uuid().optional(),
                schemaId         : joi.string().uuid().optional(),
                schemaInstanceId : joi.string().uuid().optional(),
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
        var eventType = query.eventType ? query.eventType : null;
        if (eventType != null) {
            filters['EventType'] = eventType;
        }
        var schemaId = query.schemaId ? query.schemaId : null;
        if (schemaId != null) {
            filters['ReferenceId'] = schemaId;
        }
        var schemaInstanceId = query.SchemaInstanceId ? query.SchemaInstanceId : null;
        if (schemaInstanceId != null) {
            filters['SchemaInstanceId'] = schemaInstanceId;
        }
        return filters as EventSearchFilters;
    };

}
