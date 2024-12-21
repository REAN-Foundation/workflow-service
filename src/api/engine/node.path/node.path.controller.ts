import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { NodePathValidator } from './node.path.validator';
import { ApiError } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { NodePathCreateModel } from '../../../domain.types/engine/node.path.types';
import { NodePathService } from '../../../database/services/engine/node.path.service';

///////////////////////////////////////////////////////////////////////////////////////

export class NodePathController {

    //#region Member variables and constructors

    _service: NodePathService = new NodePathService();

    _validator: NodePathValidator = new NodePathValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            const model: NodePathCreateModel = await this._validator.validateCreateRequest(request);

            const path = await this._service.create(model);
            if (path == null) {
                throw new ApiError(400, 'Cannot create record for path!');
            }
            ResponseHandler.success(request, response, 'Path record created successfully!', 201, path);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const pathId: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const updates = await this._validator.validateUpdateRequest(request);
            const path = await this._service.update(pathId, updates);
            if (path == null) {
                throw new ApiError(400, 'Cannot update record for path!');
            }
            ResponseHandler.success(request, response, 'Path record updated successfully!', 200, {
                NodePath : path,
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
                throw new ApiError(400, 'Cannot remove record for path!');
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
            const path = await this._service.getById(id);
            if (path == null) {
                throw new ApiError(404, 'Cannot retrieve record for path!');
            }
            ResponseHandler.success(request, response, 'Path record retrieved successfully!', 200, {
                NodePath : path,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            const filters = await this._validator.validateSearchRequest(request);
            const paths = await this._service.search(filters);
            ResponseHandler.success(request, response, 'Paths retrieved successfully!', 200, {
                NodePaths : paths,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getNodePaths = async (request: express.Request, response: express.Response) => {
        try {
            const nodeId: uuid = await this._validator.requestParamAsUUID(request, 'nodeId');
            const paths = await this._service.getNodePaths(nodeId);
            ResponseHandler.success(request, response, 'Node paths retrieved successfully!', 200, {
                NodePaths : paths,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    setNextNodeToPath = async (request: express.Request, response: express.Response) => {
        try {
            const pathId: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const nextNodeId: uuid = await this._validator.requestParamAsUUID(request, 'nodeId');
            const result = await this._service.setNextNodeToPath(pathId, nextNodeId);
            ResponseHandler.success(request, response, 'Path record updated successfully!', 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    // addPathCondition = async (request: express.Request, response: express.Response) => {
    //     try {
    //         const pathId: uuid = await this._validator.requestParamAsUUID(request, 'pathId');
    //         const model = await this._validator.addPathCondition(request);
    //         const condition = await this._service.addPathCondition(pathId, model);
    //         if (condition == null) {
    //             throw new ApiError(400, 'Cannot create record for path condition!');
    //         }
    //         ResponseHandler.success(request, response, 'Path condition record created successfully!', 201, {
    //             PathCondition : condition,
    //         });
    //     } catch (error) {
    //         ResponseHandler.handleError(request, response, error);
    //     }
    // };

    // updatePathCondition = async (request: express.Request, response: express.Response) => {
    //     try {
    //         const nodeId: uuid = await this._validator.getParamUuid(request, 'nodeId');
    //         // const pathId: uuid = await this._validator.getParamUuid(request, 'pathId');
    //         const conditionId: uuid = await this._validator.getParamUuid(request, 'conditionId');
    //         const templateId: uuid = await this._validator.getParamUuid(request, 'id');
    //         await this.checkNodeAndTemplate(nodeId, templateId);
    //         const updates = await this._validator.updatePathCondition(request);
    //         const condition = await this._service.updatePathCondition(conditionId, updates);
    //         if (condition == null) {
    //             throw new ApiError(400, 'Cannot update record for path condition!');
    //         }
    //         ResponseHandler.success(request, response, 'Path condition record updated successfully!', 200, {
    //             PathCondition : condition,
    //         });
    //     } catch (error) {
    //         ResponseHandler.handleError(request, response, error);
    //     }
    // };

    // deletePathCondition = async (request: express.Request, response: express.Response) => {
    //     try {
    //         const nodeId: uuid = await this._validator.getParamUuid(request, 'nodeId');
    //         // const pathId: uuid = await this._validator.getParamUuid(request, 'pathId');
    //         const conditionId: uuid = await this._validator.getParamUuid(request, 'conditionId');
    //         const templateId: uuid = await this._validator.getParamUuid(request, 'id');
    //         await this.checkNodeAndTemplate(nodeId, templateId);
    //         const deleted = await this._service.deletePathCondition(conditionId);
    //         if (!deleted) {
    //             throw new ApiError(400, 'Cannot remove record for path condition!');
    //         }
    //         ResponseHandler.success(request, response, 'Path condition record removed successfully!', 200, {
    //             Deleted : deleted,
    //         });
    //     } catch (error) {
    //         ResponseHandler.handleError(request, response, error);
    //     }
    // };

    // getPathCondition = async (request: express.Request, response: express.Response) => {
    //     try {
    //         const nodeId: uuid = await this._validator.getParamUuid(request, 'nodeId');
    //         const pathId: uuid = await this._validator.getParamUuid(request, 'pathId');
    //         const conditionId: uuid = await this._validator.getParamUuid(request, 'conditionId');
    //         const templateId: uuid = await this._validator.getParamUuid(request, 'id');
    //         await this.checkNodeAndTemplate(nodeId, templateId);
    //         const condition = await this._service.getPathCondition(conditionId, nodeId, pathId);
    //         if (condition == null) {
    //             throw new ApiError(404, 'Cannot retrieve record for path condition!');
    //         }
    //         ResponseHandler.success(request, response, 'Path condition record retrieved successfully!', 200, {
    //             PathCondition : condition,
    //         });
    //     } catch (error) {
    //         ResponseHandler.handleError(request, response, error);
    //     }
    // };

    // getPathConditionsForPath = async (request: express.Request, response: express.Response) => {
    //     try {
    //         const nodeId: uuid = await this._validator.getParamUuid(request, 'nodeId');
    //         const pathId: uuid = await this._validator.getParamUuid(request, 'pathId');
    //         const templateId: uuid = await this._validator.getParamUuid(request, 'id');
    //         await this.checkNodeAndTemplate(nodeId, templateId);
    //         const conditions = await this._service.getPathConditionForPath(pathId);
    //         ResponseHandler.success(request, response, 'Path conditions retrieved successfully!', 200, {
    //             PathConditions : conditions,
    //         });
    //     } catch (error) {
    //         ResponseHandler.handleError(request, response, error);
    //     }
    // };

}
