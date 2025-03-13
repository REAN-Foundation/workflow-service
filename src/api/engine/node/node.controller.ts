import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { NodeValidator } from './node.validator';
import { NodeService } from '../../../database/services/engine/node.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import {
    LogicalYesNoActionNodeCreateModel,
    NodeCreateModel,
    NodeSearchFilters,
    NodeUpdateModel,
    QuestionNodeCreateModel,
    LogicalTimerNodeCreateModel,
    TimerNodeCreateModel
} from '../../../domain.types/engine/node.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { NodeType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////

export class NodeController {

    //#region member variables and constructors

    _service: NodeService = new NodeService();

    _validator: NodeValidator = new NodeValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            var model: NodeCreateModel = await this._validator.validateCreateRequest(request);
            model.Type = model.Type ?? NodeType.ExecutionNode; //If generic node, it is just an execution node
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add node!');
            }
            const message = 'Node added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    createQuestionNode = async (request: express.Request, response: express.Response) => {
        try {
            var model: QuestionNodeCreateModel = await this._validator.validateCreateQuestionNodeRequest(request);
            model.Type = NodeType.QuestionNode;

            const record = await this._service.createQuestionNode(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add node!');
            }
            const message = 'Node added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    createLogicalYesNoActionNode = async (request: express.Request, response: express.Response) => {
        try {
            var model: LogicalYesNoActionNodeCreateModel = await this._validator.validateCreateLogicalYesNoActionNodeRequest(request);
            model.Type = NodeType.LogicalYesNoActionNode;

            const record = await this._service.createLogicalYesNoActionNode(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add node!');
            }
            const message = 'Node added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    createEventListenerNode = async (request: express.Request, response: express.Response) => {
        try {
            var model: NodeCreateModel = await this._validator.validateCreateRequest(request);
            model.Type = NodeType.EventListenerNode;

            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add node!');
            }
            const message = 'Node added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    createLogicalTimerNode = async (request: express.Request, response: express.Response) => {
        try {
            var model: LogicalTimerNodeCreateModel = await this._validator.validateCreateLogicalTimerNodeRequest(request);
            model.Type = NodeType.LogicalTimerNode;

            const record = await this._service.createLogicalTimerNode(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add node!');
            }
            const message = 'Node added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    createTimerNode = async (request: express.Request, response: express.Response) => {
        try {
            var model: TimerNodeCreateModel = await this._validator.validateCreateRequest(request, true);
            model.Type = NodeType.TimerNode;

            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add node!');
            }
            const message = 'Node added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    createTerminatorNode = async (request: express.Request, response: express.Response) => {
        try {
            var model: NodeCreateModel = await this._validator.validateCreateTerminatorNodeRequest(request);
            model.Type = NodeType.TerminatorNode;

            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add node!');
            }
            const message = 'Node added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        }
        catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Node retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            var model: NodeUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await this._service.update(id, model);
            const message = 'Node updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: NodeSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Node records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await this._service.delete(id);
            const message = 'Node deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    setNextNode = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            const nextNodeId = await this._validator.requestParamAsUUID(request, 'nextNodeId');
            const updatedRecord = await this._service.setNextNode(id, nextNodeId);
            const message = 'Next node set successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    setNextNodeOnTimerSuccess = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            const nextNodeId = await this._validator.requestParamAsUUID(request, 'nextNodeId');
            const updatedRecord = await this._service.setNextNodeOnTimerSuccess(id, nextNodeId);
            const message = 'Next node set successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        }
        catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    setNextNodeOnTimerTimeout = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            const nextNodeId = await this._validator.requestParamAsUUID(request, 'nextNodeId');
            const updatedRecord = await this._service.setNextNodeOnTimerTimeout(id, nextNodeId);
            const message = 'Next node set successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        }
        catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    setBaseRuleToNode = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            const ruleId = await this._validator.requestParamAsUUID(request, 'ruleId');
            const success = await this._service.setBaseRuleToNode(id, ruleId);
            const message = 'Rule set to node successfully!';
            ResponseHandler.success(request, response, message, 200, { Success: success });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
