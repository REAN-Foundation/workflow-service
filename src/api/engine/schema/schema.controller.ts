import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { SchemaValidator } from './schema.validator';
import { SchemaService } from '../../../database/services/engine/schema.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { SchemaCreateModel, SchemaSearchFilters, SchemaUpdateModel } from '../../../domain.types/engine/schema.domain.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { XSchema } from '../../../domain.types/engine/engine.types';

///////////////////////////////////////////////////////////////////////////////////////

export class SchemaController {

    //#region member variables and constructors

    _service: SchemaService = new SchemaService();

    _validator: SchemaValidator = new SchemaValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            var model: SchemaCreateModel = await this._validator.validateCreateRequest(request);
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add schema!');
            }
            const message = 'Schema added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Schema retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            var model: SchemaUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await this._service.update(id, model);
            const message = 'Schema updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: SchemaSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Schema records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await this._service.delete(id);
            const message = 'Schema deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    //#endregion

}
