import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { BadgeValidator } from './badge.validator';
import { BadgeService } from '../../../database/services/awards/badge.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { BadgeCreateModel, BadgeSearchFilters, BadgeUpdateModel } from '../../../domain.types/awards/badge.domain.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { BadgeStockImageService } from '../../../database/services/badge.stock.images/badge.stock.image.service';

///////////////////////////////////////////////////////////////////////////////////////

export class BadgeController {

    //#region member variables and constructors

    _service: BadgeService = new BadgeService();

    _badgeStockservice: BadgeStockImageService = new BadgeStockImageService();

    _validator: BadgeValidator = new BadgeValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            var model: BadgeCreateModel = await this._validator.validateCreateRequest(request);
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add badge!');
            }
            const message = 'Badge added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Badge retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getAll = async (request: express.Request, response: express.Response) => {
        try {
            const records = await this._service.search({});
            const message = 'Badge records with how to earn content retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, records);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            var model: BadgeUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await this._service.update(id, model);
            const message = 'Badge updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: BadgeSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Badge records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await this._service.delete(id);
            const message = 'Badge deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getStockBadgeImages = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            const images = await this._badgeStockservice.getAll();
            const message = 'Badge stock images retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, images);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
