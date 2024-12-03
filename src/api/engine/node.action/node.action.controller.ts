import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { NodeActionValidator } from './node.action.validator';
import { ApiError } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { NodeActionCreateModel } from '../../../domain.types/engine/node.action.types';
import { NodeActionService } from '../../../database/services/engine/node.action.service';

///////////////////////////////////////////////////////////////////////////////////////

export class NodeActionController {

    //#region Member variables and constructors

    _service: NodeActionService = new NodeActionService();

    _validator: NodeActionValidator = new NodeActionValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            const model: NodeActionCreateModel = await this._validator.validateCreateRequest(request);

            const action = await this._service.create(model);
            if (action == null) {
                throw new ApiError(400, 'Cannot create record for action!');
            }
            ResponseHandler.success(request, response, 'Path record created successfully!', 201, action);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const pathId: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const updates = await this._validator.validateUpdateRequest(request);
            const action = await this._service.update(pathId, updates);
            if (action == null) {
                throw new ApiError(400, 'Cannot update record for action!');
            }
            ResponseHandler.success(request, response, 'Path record updated successfully!', 200, {
                NodeAction : action,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response) => {
        try {
            const id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const deleted = await this._service.delete(id);
            if (!deleted) {
                throw new ApiError(400, 'Cannot remove record for action!');
            }
            ResponseHandler.success(request, response, 'Path record removed successfully!', 200, {
                Deleted : deleted,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            const id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const action = await this._service.getById(id);
            if (action == null) {
                throw new ApiError(404, 'Cannot retrieve record for action!');
            }
            ResponseHandler.success(request, response, 'Path record retrieved successfully!', 200, {
                NodeAction : action,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            const filters = await this._validator.validateSearchRequest(request);
            const actions = await this._service.search(filters);
            ResponseHandler.success(request, response, 'Actions retrieved successfully!', 200, {
                NodeActions : actions,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getNodeActions = async (request: express.Request, response: express.Response) => {
        try {
            const nodeId: uuid = await this._validator.requestParamAsUUID(request, 'nodeId');
            const actions = await this._service.getNodeActions(nodeId);
            ResponseHandler.success(request, response, 'Node actions retrieved successfully!', 200, {
                NodeActions : actions,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
