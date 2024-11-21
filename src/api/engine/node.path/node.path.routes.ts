import joi from 'joi';
import express from 'express';
import {
    NodePathCreateModel,
    NodePathUpdateModel,
    NodePathSearchFilters
} from '../../../domain.types/engine/node.path.domain.types';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';


///////////////////////////////////////////////////////////////////////////////////////////////

export class NodePathValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<NodePathCreateModel> => {
        try {
        }
        catch (error) {
            ErrorHandler.handle(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request)
        : Promise<NodePathUpdateModel> => {
        try {
        }
        catch (error) {
            ErrorHandler.handle(error);
        }
    };

    public validateSearchRequest = async (request: express.Request)
        : Promise<NodePathSearchFilters> => {
        try {
        }
        catch (error) {
            ErrorHandler.handle(error);
        }
    };

}
