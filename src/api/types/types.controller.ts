import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { ErrorHandler } from '../../common/handlers/error.handler';
import { RoleService } from '../../database/services/user/role.service';
import {
    ActionTypeList,
    CompositionOperatorList,
    ConditionOperandDataTypeList,
    ExecutionStatusList,
    InputSourceTypeList,
    MathematicalOperatorList,
    NodeTypeList
} from '../../domain.types/engine/engine.enums';
import { LogicalOperatorList } from '../../domain.types/engine/engine.enums';
import { OperatorList } from '../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////////////////////

export class TypesController {

    //#region member variables and constructors

    _roleService: RoleService = null;

    constructor() {
        this._roleService = new RoleService();
    }

    //#endregion

    //#region Action methods

    getRoleTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            const types = await this._roleService.getAll();
            if (types === null || types.length === 0) {
                ErrorHandler.throwInternalServerError(`Unable to retrieve user role types!`);
            }
            ResponseHandler.success(request, response, 'User role types retrieved successfully!', 200, {
                Types : types,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getNodeTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Node types retrieved successfully!', 200, {
                Types : NodeTypeList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getActionTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Action types retrieved successfully!', 200, {
                Types : ActionTypeList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getConditionOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Condition operator types retrieved successfully!', 200, {
                Types : OperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getLogicalOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Logical operator types retrieved successfully!', 200, {
                Types : LogicalOperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getCompositeOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Composite operator types retrieved successfully!', 200, {
                Types : CompositionOperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getMathematicalOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Mathematical operator types retrieved successfully!', 200, {
                Types : MathematicalOperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getOperandDataTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Operand data types retrieved successfully!', 200, {
                Types : ConditionOperandDataTypeList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getExecutionStatusTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Execution status types retrieved successfully!', 200, {
                Types : ExecutionStatusList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getInputSourceTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Input source types retrieved successfully!', 200, {
                Types : InputSourceTypeList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    //#endregion

}
