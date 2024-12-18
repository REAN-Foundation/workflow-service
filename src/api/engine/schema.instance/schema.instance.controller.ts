import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { SchemaInstanceValidator } from './schema.instance.validator';
import { SchemaInstanceService } from '../../../database/services/engine/schema.instance.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { SchemaInstanceCreateModel, SchemaInstanceSearchFilters, SchemaInstanceUpdateModel } from '../../../domain.types/engine/schema.instance.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';

///////////////////////////////////////////////////////////////////////////////////////

export class SchemaInstanceController {

    //#region member variables and constructors

    _service: SchemaInstanceService = new SchemaInstanceService();

    _validator: SchemaInstanceValidator = new SchemaInstanceValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            var model: SchemaInstanceCreateModel = await this._validator.validateCreateRequest(request);
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add schema instance!');
            }
            const message = 'SchemaInstance added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'SchemaInstance retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            var model: SchemaInstanceUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await this._service.update(id, model);
            const message = 'SchemaInstance updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: SchemaInstanceSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'SchemaInstance records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await this._service.delete(id);
            const message = 'SchemaInstance deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getActivityHistory = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const activityHistory = await this._service.getActivityHistory(id);
            const message = 'SchemaInstance activity history retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, activityHistory);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getActivitySummary = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const activitySummary = await this._service.getActivitySummary(id);
            const message = 'SchemaInstance activity summary retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, activitySummary);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
