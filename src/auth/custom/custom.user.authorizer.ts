import express from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../logger/logger';
import { IUserAuthorizer } from '../interfaces/user.authorizer.interface';
import { CurrentUser } from '../../domain.types/miscellaneous/current.user';
import { ConfigurationManager } from '../../config/configuration.manager';
import { Injector } from '../../startup/injector';
import { UserService } from '../../database/services/user/user.service';

//////////////////////////////////////////////////////////////

export class CustomUserAuthorizer implements IUserAuthorizer {

    _userService: UserService = null;

    constructor() {
        this._userService = Injector.Container.resolve(UserService);
    }

    public authorize = async (request: express.Request): Promise<boolean> => {
        try {
            const currentUser = request.currentUser;
            const context = request.context;
            if (context == null || context === 'undefined') {
                return false;
            }
            if (currentUser == null) {
                return false;
            }

            // const user = await this._userService.getById(currentUser.UserId);

            return true;
        } catch (error) {
            logger.error(error.message);
        }
        return false;
    };

    public generateUserSessionToken = async (user: CurrentUser): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const expiresIn: number = ConfigurationManager.JwtExpiresIn;
                var seconds = expiresIn.toString() + 's';
                const token = jwt.sign(user, process.env.USER_ACCESS_TOKEN_SECRET, { expiresIn: seconds });
                resolve(token);
            } catch (error) {
                reject(error);
            }
        });
    };

}
