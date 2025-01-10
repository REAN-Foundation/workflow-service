import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { UserService } from '../../database/services/user/user.service';
import { ErrorHandler } from '../../common/handlers/error.handler';
import { Helper } from '../../common/helper';
import { UserValidator } from './user.validator';
import {
    UserResponseDto,
    UserSearchFilters,
    UserSearchResults,
    UserUpdateModel
} from '../../domain.types/user/user.domain.types';
import { uuid } from '../../domain.types/miscellaneous/system.types';
import { CurrentUser } from '../../domain.types/miscellaneous/current.user';
import { RoleService } from '../../database/services/user/role.service';
import { StringUtils } from '../../common/utilities/string.utils';
import { AuthHandler } from '../../auth/auth.handler';
import { startSpan, endSpan, recordSpanException } from '../../telemetry/instrumenter';

///////////////////////////////////////////////////////////////////////////////////////

export class UserController {

    //#region member variables and constructors

    _service: UserService = new UserService();

    _roleService: RoleService = new RoleService();

    _validator: UserValidator = new UserValidator();


    //#endregion

    create = async (request: express.Request, response: express.Response): Promise <void> => {
        try {
            const userCreateModel = await this._validator.validateCreateRequest(request);
            const record: UserResponseDto = await this._service.create(userCreateModel);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to create user!', 400);
            }
            // if (requestBody.CurrentUserId && dto.Email) {
            //     sendOnboardingEmail(dto, password)
            // }
            const message = 'User added successfully!';
            ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response): Promise <void> => {
        try {
            const id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record: UserResponseDto = await this._service.getById(id);
            if (record === null) {
                ErrorHandler.throwNotFoundError('User with id ' + id.toString() + ' cannot be found!');
            }
            const message = 'User retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response): Promise <void> => {
        try {
            var filters: UserSearchFilters = await this._validator.validateSearchRequest(request);
            var searchResults: UserSearchResults = await this._service.search(filters);
            const message = 'User records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response): Promise <void> => {
        try {
            const id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const updateModel: UserUpdateModel = await this._validator.validateUpdateRequest(request);
            const updated: UserResponseDto = await this._service.update(id, updateModel);
            if (updated == null) {
                ErrorHandler.throwInternalServerError('Unable to update user!', 400);
            }
            const message = 'User updated successfully!';
            ResponseHandler.success(request, response, message, 200, updated);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            const record: UserResponseDto = await this._service.getById(id);
            if (record == null) {
                ErrorHandler.throwNotFoundError('User with id ' + id.toString() + ' cannot be found!');
            }
            const userDeleted: boolean = await this._service.delete(id);
            const result = {
                Deleted : userDeleted
            };
            const message = 'User deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    loginWithPassword = async (request: express.Request, response: express.Response): Promise <void> => {
        const span = startSpan('UserController:loginWithPassword');
        try {
            await this._validator.validateLoginWithPasswordRequest(request);
            const loginModel = await this.getLoginModel(request.body);
            const sentPassword = loginModel.Password;
            const hashedPassword = loginModel.User.Password;
            const validPassword = StringUtils.compareHashedPassword(sentPassword, hashedPassword);
            if (!validPassword) {
                ErrorHandler.throwUnauthorizedUserError('Invalid password.');
            }
            const user: UserResponseDto = await this._service.getById(loginModel.User.id);
            const loginSession = await this._service.createUserLoginSession(user.id);
            const currentUser: CurrentUser = this.constructCurrentUser(user, loginSession.id);
            const accessToken = await AuthHandler.generateUserSessionToken(currentUser);
            const result = {
                User        : currentUser,
                AccessToken : accessToken,
                ExpiresIn   : loginSession.ValidTill
            };
            const message = 'User logged in successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
            recordSpanException(span, error);
        }
        endSpan(span);
    };

    changePassword = async (request: express.Request, response: express.Response): Promise <void> => {
        try {
            await this._validator.validatePasswordChangeRequest(request);
            const passwordResetModel = await this.getPasswordChangeModel(request.body);
            const existingHashedPassword = await this._service.getUserHashedPassword(request.body.CurrentUserId);
            const validPassword = StringUtils.compareHashedPassword(
                passwordResetModel.OldPassword,
                existingHashedPassword);
            if (!validPassword) {
                ErrorHandler.throwUnauthorizedUserError('Invalid old password!');
            }
            const newHashedPassword = StringUtils.generateHashedPassword(passwordResetModel.NewPassword);
            const result = await this._service.resetPassword(passwordResetModel.User.id, newHashedPassword);
            const message = 'Password reset successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    // loginWithOtp = async (request: express.Request, response: express.Response): Promise <void> => {
    //     try {
    //         await this._validator.validateLoginWithOtpRequest(requestBody);
    //         const loginModel = await this.getLoginModel(requestBody);
    //         const latestOtp = await this._otpService.getLatestActiveOtp(loginModel.User.id);
    //         if (latestOtp == null) {
    //             ErrorHandler.throwUnauthorizedUserError('Invalid OTP');
    //         }
    //         if (latestOtp.ValidTill < new Date()) {
    //             ErrorHandler.throwUnauthorizedUserError('Otp has expired. Please regenerate OTP again!');
    //         }
    //         if (latestOtp.Otp !== loginModel.Otp) {
    //             ErrorHandler.throwUnauthorizedUserError('Invalid OTP. Please try again!');
    //         }
    //         // mark OTP as used
    //         this._otpService.markAsUsed(latestOtp.id);
    //         const user = await this._service.getById(loginModel.User.id);
    //         const loginSession = await this._service.createUserLoginSession(user.id);
    //         const currentUser: CurrentUser = this.constructCurrentUser(user, loginSession.id);
    //         const accessToken = await AuthHandler.generateUserSessionToken(currentUser);
    //         currentUser['ImageUrl'] = user.ImageUrl ?? '';
    //         const result = {
    //             User        : currentUser,
    //             AccessToken : accessToken
    //         };  ExpiresIn   : loginSession.ValidTill
    //         };
    //         const message = 'User logged in successfully!';
    //         ResponseHandler.success(request, response, message, 200, result);
    //     } catch (error) {
    //         ResponseHandler.handleError(request, response, error);
    //     }
    // };

    // sendOtp = async (request: express.Request, response: express.Response): Promise <void> => {
    //     try {
    //         await this._validator.validateSendOtpRequest(requestBody);
    //         const countryCode = (typeof requestBody.CountryCode !== undefined) ? requestBody.CountryCode : '+91';
    //         const phone = (typeof requestBody.Phone !== undefined) ? requestBody.Phone : null;
    //         const user = await this._service.getUser(countryCode, phone, null, null);
    //         if (user === null) {
    //             ErrorHandler.throwNotFoundError('User does not exist!');
    //         }
    //         const otp = await this._otpService.create(user.id, requestBody.Purpose ?? 'Login');
    //         var result = true;
    //         if (otp != null) {
    //             const appIdentifier = 'LMS';
    //             const phoneStr = countryCode + '-' + phone;
    //             const message = `Dear ${user.FirstName}, ${otp.Otp} is OTP for your ${appIdentifier} login and will expire in 10 mins.`;
    //             const sendStatus = await this._smsService.sendSMS(phoneStr, message);
    //             if (sendStatus) {
    //                 logger.log('Otp sent successfully.\n ' + JSON.stringify(otp, null, 2));
    //             }
    //             result = true;
    //         }
    //         result = false;
    //         const message = 'Otp sent successfully!';
    //         ResponseHandler.success(request, response, message, 200, result);
    //     } catch (error) {
    //         ResponseHandler.handleError(request, response, error);
    //     }
    // };

    logout = async (request: express.Request, response: express.Response): Promise <void> => {
        try {
            const sessionId = request.currentUser.SessionId;
            const result = await this._service.invalidateUserLoginSession(sessionId);
            const message = 'User logged out successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getRoleTypes = async (request: express.Request, response: express.Response): Promise <void> => {
        try {
            const roleTypes = await this._roleService.getAll();
            const message = 'Role types retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, roleTypes);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    private getLoginModel = async (requestBody) => {

        const countryCode = requestBody.Phone && requestBody.Phone.CountryCode ? requestBody.Phone.CountryCode : '+91';
        const phone = requestBody.Phone && requestBody.Phone.PhoneNumber ? requestBody.Phone.PhoneNumber : null;
        const email = (typeof requestBody.Email !== 'undefined') ? requestBody.Email : null;
        const userName = (typeof requestBody.UserName !== 'undefined') ? requestBody.UserName : null;
        const password = (typeof requestBody.Password !== 'undefined') ? requestBody.Password : null;
        const otp = (typeof requestBody.Otp !== 'undefined') ? requestBody.Otp.toString() : null;

        const user = await this._service.getUser(countryCode, phone, email, userName);
        if (user === null) {
            ErrorHandler.throwNotFoundError('User does not exist!');
        }

        return {
            User     : user,
            Password : password,
            Otp      : otp
        };
    };

    private getPasswordChangeModel = async (requestBody) => {
        const oldPassword = requestBody.OldPassword;
        const newPassword = requestBody.NewPassword;
        const user = await this._service.getById(requestBody.CurrentUserId);
        if (user === null) {
            ErrorHandler.throwNotFoundError('User does not exist!');
        }
        return {
            User        : user,
            OldPassword : oldPassword,
            NewPassword : newPassword,
        };
    };

    private constructCurrentUser = (user, sessionId): CurrentUser => {
        return {
            UserId        : user.id,
            UserName      : user.UserName,
            CurrentRoleId : user.RoleId,
            DisplayName   : Helper.getFullName(user.Prefix, user.FirstName, user.LastName),
            SessionId     : sessionId,
            Phone         : user.CountryCode + '-' + user.Phone,
            Email         : user.Email
        };
    };

}
