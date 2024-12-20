import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { EventValidator } from './event.validator';
import { EventService } from '../../../database/services/engine/event.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { EventSearchFilters, EventCreateModel } from '../../../domain.types/engine/event.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import EventHandler from '../../../modules/engine.execution/event.handler';

///////////////////////////////////////////////////////////////////////////////////////

export class EventController {

    //#region member variables and constructors

    _service: EventService = new EventService();

    _validator: EventValidator = new EventValidator();

    //#endregion

    createUserMessageEvent = async (request: express.Request, response: express.Response) => {
        try {
            var model: EventCreateModel = await this._validator.validateCreateMessageEventRequest(request);
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add event!');
            }
            EventHandler.handle(record);
            const message = 'Event created successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Event retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: EventSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Event records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
