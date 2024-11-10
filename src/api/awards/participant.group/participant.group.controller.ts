import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { ParticipantGroupValidator } from './participant.group.validator';
import { ParticipantGroupService } from '../../../database/services/awards/participant.group.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { ParticipantGroupCreateModel, ParticipantGroupSearchFilters, ParticipantGroupUpdateModel } from '../../../domain.types/awards/participant.group.domain.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';

///////////////////////////////////////////////////////////////////////////////////////

export class ParticipantGroupController {

    //#region member variables and constructors

    _service: ParticipantGroupService = new ParticipantGroupService();

    _validator: ParticipantGroupValidator = new ParticipantGroupValidator();


    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            var model: ParticipantGroupCreateModel = await this._validator.validateCreateRequest(request);
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add participant!');
            }
            const message = 'Participant group added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Participant group retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            var model: ParticipantGroupUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await this._service.update(id, model);
            const message = 'Participant group updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: ParticipantGroupSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Participant group records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await this._service.delete(id);
            const message = 'Participant group deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    addParticipant = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            var participantId: uuid = await this._validator.requestParamAsUUID(request, 'participantId');
            const result = await this._service.addParticipant(id, participantId);
            const message = 'Participant added to group successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    removeParticipant = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            var participantId: uuid = await this._validator.requestParamAsUUID(request, 'participantId');
            const result = await this._service.removeParticipant(id, participantId);
            const message = 'Participant removed from group successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getParticipants = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await this._service.getParticipants(id);
            const message = 'Participants retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
