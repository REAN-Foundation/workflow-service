import { Request, Response, NextFunction } from 'express';
import { UserAuthorizer } from './wrappers/user.authorizer';
import { UserAuthenticator } from './wrappers/user.authenticator';
import { ClientAuthenticator } from './wrappers/client.authenticator';
import { ErrorHandler } from '../common/handlers/error.handler';
import { ResponseHandler } from '../common/handlers/response.handler';
import { Injector } from '../startup/injector';

////////////////////////////////////////////////////////////////////////
export type AuthMiddleware = (request: Request, response: Response, next: NextFunction) => Promise<void>;
////////////////////////////////////////////////////////////////////////

export class AuthHandler {

    public static handle = (
        context:string, 
        authenticateClient = true, 
        authenticateUser = true, 
        authorizeUser = true): AuthMiddleware[] => {

        var middlewares: AuthMiddleware[] = [];

        //Set context
        var contextSetter = async (request: Request, response: Response, next: NextFunction) => {
            request.context = context;
            const tokens = context.split('.');
            if (tokens.length < 2) {
                ResponseHandler.failure(request, response, 'Invalid request context', 400);
                return;
            }
            const resourceType = tokens[0];
            request.context = context;
            request.resourceType = resourceType;
            if (request.params.id !== undefined && request.params.id !== null) {
                request.resourceId = request.params.id;
            }
            next();
        };
        middlewares.push(contextSetter);

        //Line-up the auth middleware chian
        if (authenticateClient) {
            var clientAuthenticator = Injector.Container.resolve(ClientAuthenticator);
            middlewares.push(clientAuthenticator.authenticate);
        }
        if (authenticateUser) {
            var userAuthenticator = Injector.Container.resolve(UserAuthenticator);
            middlewares.push(userAuthenticator.authenticate);
        }
        if (authorizeUser) {
            var authorizer = Injector.Container.resolve(UserAuthorizer);
            middlewares.push(authorizer.authorize);
        }

        return middlewares;
    }

    public static verifyAccess = async(request: Request): Promise<boolean> => {

        var clientAuthenticator = Injector.Container.resolve(ClientAuthenticator);
        const clientVerified = await clientAuthenticator.verify(request);
        if (clientVerified === false){
            ErrorHandler.throwInternalServerError('Unauthorized access', 401);
        }

        var userAuthenticator = Injector.Container.resolve(UserAuthenticator);
        const userVerified = await userAuthenticator.verify(request);
        if (userVerified === false){
            ErrorHandler.throwInternalServerError('Unauthorized access', 401);
        }

        var userAuthorizer = Injector.Container.resolve(UserAuthorizer);
        const authorized = await userAuthorizer.verify(request);
        if (authorized === false){
            ErrorHandler.throwUnauthorizedUserError('Unauthorized access');
        }
        return true;
    };

    public static generateUserSessionToken = async (user: any): Promise<string> => {
        var authorizer = Injector.Container.resolve(UserAuthorizer);
        return await authorizer.generateUserSessionToken(user);
    };

}
