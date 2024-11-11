import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { IncomingEventValidator } from './incoming.event.validator';
import { IncomingEventService } from '../../../database/services/engine/incoming.event.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { IncomingEventCreateModel, IncomingEventSearchFilters } from '../../../domain.types/engine/incoming.event.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import EventHandler from '../../../modules/engine.execution/event.handler';

///////////////////////////////////////////////////////////////////////////////////////

export class IncomingEventController {

    //#region member variables and constructors

    _service: IncomingEventService = new IncomingEventService();

    _validator: IncomingEventValidator = new IncomingEventValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            var model: IncomingEventCreateModel = await this._validator.validateCreateRequest(request);
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add event!');
            }
            EventHandler.handle(record);
            const message = 'Incoming event handled successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Incoming event retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: IncomingEventSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Incoming event records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
