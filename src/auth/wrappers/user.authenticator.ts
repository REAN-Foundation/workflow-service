import 'reflect-metadata';
import express from 'express';
import { IUserAuthenticator } from '../interfaces/user.authenticator.interface';
import { injectable, inject } from "tsyringe";
import { ResponseHandler } from '../../common/handlers/response.handler';
import { logger } from '../../logger/logger';

////////////////////////////////////////////////////////////////////////

@injectable()
export class UserAuthenticator {

    constructor(
        @inject('IUserAuthenticator') private _authenticator: IUserAuthenticator
    ) {}

    public authenticate = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ): Promise<void> => {
        try {
            const authResult = await this._authenticator.authenticate(request);
            if (authResult.Result === false){
                ResponseHandler.failure(request, response, authResult.Message, authResult.HttpErrorCode);
            }
            next();
        } catch (error) {
            logger.error(error.message);
            ResponseHandler.failure(request, response, 'User authentication error: ' + error.message, 401);
        }
    };

    public verify = async (request: express.Request): Promise<boolean> => {
        const authResult = await this._authenticator.authenticate(request);
        return authResult.Result;
    };

}

////////////////////////////////////////////////////////////////////////
