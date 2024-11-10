import express from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../logger/logger';
import { AuthenticationResult } from '../../domain.types/user/auth.domain.types';
import { CurrentClient } from '../../domain.types/miscellaneous/current.client';
import { ClientService } from '../../database/services/client/client.service';
import { Injector } from '../../startup/injector';
import { IClientAuthenticator } from '../interfaces/client.authenticator.interface';

//////////////////////////////////////////////////////////////

export class CustomClientAuthenticator implements IClientAuthenticator {

    _clientService: ClientService = null;

    constructor() {
        this._clientService = Injector.Container.resolve(ClientService);
    }

    public authenticate = async (request: express.Request): Promise<AuthenticationResult> => {
        try {

            var res: AuthenticationResult = {
                Result        : true,
                Message       : 'Authenticated',
                HttpErrorCode : 200,
            };
            let apiKey: string = request.headers['x-api-key'] as string;

            if (!apiKey) {
                res = {
                    Result        : false,
                    Message       : 'Missing API key for the client',
                    HttpErrorCode : 401,
                };
                return res;
            }
            apiKey = apiKey.trim();

            const client: CurrentClient = await this._clientService.isApiKeyValid(apiKey);
            if (!client) {
                res = {
                    Result        : false,
                    Message       : 'Invalid API Key: Forebidden access',
                    HttpErrorCode : 403,
                };
                return res;
            }
            request.currentClient = client;

        } catch (err) {
            logger.error(JSON.stringify(err, null, 2));
            res = {
                Result        : false,
                Message       : 'Error authenticating client',
                HttpErrorCode : 401,
            };
        }
        return res;
    };

}
