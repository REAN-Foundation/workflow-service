import express from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../logger/logger';
import { AuthenticationResult } from '../../domain.types/user/auth.domain.types';
import { ClientService } from '../../database/services/client/client.service';
import { Injector } from '../../startup/injector';
import { IUserAuthenticator } from '../interfaces/user.authenticator.interface';

/////////////////////////////////////////////////////////////////////////////////

export class CustomUserAuthenticator implements IUserAuthenticator {

    public authenticate = async (
        request: express.Request
    ): Promise<AuthenticationResult> => {
        try {

            var res: AuthenticationResult = {
                Result        : true,
                Message       : 'Authenticated',
                HttpErrorCode : 200,
            };

            const authHeader = request.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (token == null) {
                var IsPrivileged = request.currentClient.IsPrivileged as boolean;
                if (IsPrivileged) {
                    return res;
                }

                res = {
                    Result        : false,
                    Message       : 'Unauthorized user access',
                    HttpErrorCode : 401,
                };
                return res;
            }

            jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET, (error, user) => {
                if (error) {
                    res = {
                        Result        : false,
                        Message       : 'Forebidden user access',
                        HttpErrorCode : 403,
                    };
                    return res;
                }
                request.currentUser = user;
            });

        } catch (err) {
            logger.error(JSON.stringify(err, null, 2));
            res = {
                Result        : false,
                Message       : 'Error authenticating user',
                HttpErrorCode : 401,
            };
        }
        return res;
    };

}
