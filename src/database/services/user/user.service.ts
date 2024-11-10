import { Source } from '../../database.connector';
import { User } from '../../models/user/user.model';
import { UserLoginSession } from '../../models/user/user.login.session.model';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { passwordStrength } from 'check-password-strength';
import { Helper } from '../../../common/helper';
import { TimeUtils } from '../../../common/utilities/time.utils';
import { StringUtils } from '../../../common/utilities/string.utils';
import { TypeUtils } from '../../../common/utilities/type.utils';
import { DurationType } from '../../../domain.types/miscellaneous/time.types';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { UserCreateModel, UserResponseDto, UserSearchFilters, UserSearchResults, UserUpdateModel } from '../../../domain.types/user/user.domain.types';
import { logger } from '../../../logger/logger';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { Client } from '../../../database/models/client/client.model';
import { UserMapper } from '../../../database/mappers/user/user.mapper';
import { Role } from '../../../database/models/user/role.model';
import { Trace, endSpan, getServiceName, recordSpanException, startSpan } from '../../../telemetry/instrumenter';
import e from 'express';
import { trace } from '@opentelemetry/api';

///////////////////////////////////////////////////////////////////////////////////////////////

export class UserService {

    //#region Repositories

    _userRepository: Repository<User> = Source.getRepository(User);

    _clientRepository: Repository<Client> = Source.getRepository(Client);

    _roleRepository: Repository<Role> = Source.getRepository(Role);

    _userLoginSessionRepository: Repository<UserLoginSession> = Source.getRepository(UserLoginSession);

    //#endregion

    _selectAll = {
        id              : true,
        Prefix          : true,
        FirstName       : true,
        LastName        : true,
        Gender          : true,
        UserName        : true,
        ProfileImageUrl : true,
        BirthDate       : true,
        CountryCode     : true,
        Phone           : true,
        Email           : true,
        CreatedAt       : true,
        UpdatedAt       : true,
        Client          : {
            id   : true,
            Code : true,
            Name : true,
        },
        Roles : {
            id   : true,
            Name : true,
        }
    };

    create = async (createModel: UserCreateModel): Promise<UserResponseDto> => {
        try {
            const user = new User();
            var client : Client = null;
            if (createModel.ClientId) {
                client = await this._clientRepository.findOne({
                    where : {
                        id : createModel.ClientId
                    }
                });
                delete createModel.ClientId;
            }
            var role : Role = null;
            if (createModel.RoleId) {
                role = await this._roleRepository.findOne({
                    where : {
                        id : createModel.RoleId
                    }
                });
                delete createModel.RoleId;
            }
            Object.assign(user, createModel);
            user.Client = client;
            user.Roles = [role];
            var record = await this._userRepository.save(user);
            return UserMapper.toResponseDto(record);
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to create user!', error);
        }
    };

    async getById(id: uuid): Promise<UserResponseDto> {
        const span = startSpan('DbAccess:UserService:getById');
        try {
            var record = await this._userRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Client : true,
                    Roles  : true
                },
                select : this._selectAll
            });
            return UserMapper.toResponseDto(record);
        } catch (error) {
            recordSpanException(span, error);
            ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve user!', error);
        } finally {
            endSpan(span);
        }
    };

    // @Trace('DbAccess:UserService:getById')
    // async getById(id): Promise<UserResponseDto> {
    //     try {
    //         var record = await this._userRepository.findOne({
    //             where : {
    //                 id : id
    //             },
    //             relations : {
    //                 Client : true,
    //                 Roles  : true
    //             },
    //             select : this._selectAll
    //         });
    //         return UserMapper.toResponseDto(record);
    //     } catch (error) {
    //         ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve user!', error);
    //     }
    // };

    getUserHashedPassword = async (id: uuid): Promise<string> => {
        try {
            var record = await this._userRepository.findOne({
                where : {
                    id : id
                }
            });
            return record.Password;
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve user!', error);
        }
    };

    exists = async (id: uuid): Promise<boolean> => {
        try {
            const record = await this._userRepository.findOne({
                where : {
                    id : id
                }
            });
            return record !== null;
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to determine existance of user!', error);
        }
    };

    search = async (filters: UserSearchFilters): Promise<UserSearchResults> => {
        try {

            var search : FindManyOptions<User> = {
                relations : {
                },
                where : {
                },
                select : this._selectAll
            };

            if (filters.ClientId) {
                search.relations['Client'] = true;
                search.where['Client'] = {
                    id : filters.ClientId
                };
            }
            if (filters.FirstName) {
                search.where['FirstName'] =  Like(`%${filters.FirstName}%`);
            }

            if (filters.LastName) {
                search.where['LastName'] =  Like(`%${filters.LastName}%`);
            }

            if (filters.Phone) {
                search.where['Phone'] = Like(`%${filters.Phone}%`);
            }

            if (filters.Email) {
                search.where['Email'] = Like(`%${filters.Email}%`);
            }

            //Sorting
            let orderByColumn = 'CreatedAt';
            if (filters.OrderBy) {
                orderByColumn = filters.OrderBy;
            }
            let order = 'ASC';
            if (filters.Order === 'descending') {
                order = 'DESC';
            }
            search['order'] = {};
            search['order'][orderByColumn] = order;

            //Pagination
            let limit = 25;
            if (filters.ItemsPerPage) {
                limit = filters.ItemsPerPage;
            }
            let offset = 0;
            let pageIndex = 0;
            if (filters.PageIndex) {
                pageIndex = filters.PageIndex < 0 ? 0 : filters.PageIndex;
                offset = pageIndex * limit;
            }
            search['take'] = limit;
            search['skip'] = offset;

            const [list, count] = await this._userRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => UserMapper.toResponseDto(x)),
            };

            return searchResults;

        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    update = async (id: uuid, model: UserUpdateModel) => {
        try {
            const user = await this._userRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!user) {
                ErrorHandler.throwNotFoundError('User not found!');
            }
            if (model.UserName != null) {
                user.UserName = model.UserName;
            }
            if (model.Prefix != null) {
                user.Prefix = model.Prefix;
            }
            if (model.FirstName != null) {
                user.FirstName = model.FirstName;
            }
            if (model.LastName != null) {
                user.LastName = model.LastName;
            }
            if (model.CountryCode != null) {
                user.CountryCode = model.CountryCode;
            }
            if (model.Phone != null) {
                user.Phone = model.Phone;
            }
            if (model.Email != null) {
                user.Email = model.Email;
            }
            if (model.Gender != null) {
                user.Gender = model.Gender;
            }
            if (model.BirthDate != null) {
                user.BirthDate = model.BirthDate;
            }
            if (model.ProfileImageUrl != null) {
                user.ProfileImageUrl = model.ProfileImageUrl;
            }
            var record = await this._userRepository.save(user);
            return UserMapper.toResponseDto(record);
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to update user!', error);
        }
    };

    delete = async (id) => {
        try {
            var record = await this._userRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._userRepository.remove(record);
            return result != null;
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to delete user!', error);
        }
    };

    getUserWithPhone = async (countryCode, phone) => {
        try {
            const record = await this._userRepository.findOne({
                where : {
                    Phone       : phone,
                    CountryCode : countryCode
                }
            });
            return record;
        } catch (error) {
            ErrorHandler.throwDbAccessError('Unable to check if user exists with phone!', error);
        }
    };

    getUserWithEmail = async (email) => {
        try {
            const record = await this._userRepository.findOne({
                where : {
                    Email : email
                }
            });
            return record;
        } catch (error) {
            ErrorHandler.throwDbAccessError('Unable to check if user exists with email!', error);
        }
    };

    getUserWithUserName = async (username) => {
        try {
            const record = await this._userRepository.findOne({
                where : {
                    UserName : username
                }
            });
            return record;
        } catch (error) {
            ErrorHandler.throwDbAccessError('Unable to check username!', error);
        }
    };

    generateUserNameIfDoesNotExist = async (userName: string) => {
        var tmpUsername = userName ?? StringUtils.generateUserName();
        while (await this.getUserWithUserName(tmpUsername) != null) {
            tmpUsername = StringUtils.generateUserName();
        }
        return tmpUsername;
    };

    getUser = async (
        countryCode,
        phone,
        email,
        userName
    ) => {

        if (phone !== null && countryCode !== null) {
            const user = await this._userRepository.findOne({
                where : {
                    Phone       : phone,
                    CountryCode : countryCode
                }
            });
            if (user != null) {
                return user;
            }
        }

        else if (email !== null) {
            const user = await this._userRepository.findOne({
                where : {
                    Email : email,
                }
            });
            if (user != null) {
                return user;
            }
        }
        else if (userName !== null) {
            const user = await this._userRepository.findOne({
                where : {
                    UserName : userName,
                }
            });
            if (user != null) {
                return user;
            }
        }
        return null;
    };

    getUserUpdateModel = (inputModel: UserUpdateModel) => {

        var updateModel: any = {};

        if (TypeUtils.hasProperty(inputModel, 'Prefix')) {
            updateModel.Prefix = inputModel.Prefix;
        }
        if (TypeUtils.hasProperty(inputModel, 'FirstName')) {
            updateModel.FirstName = inputModel.FirstName;
        }
        if (TypeUtils.hasProperty(inputModel, 'LastName')) {
            updateModel.LastName = inputModel.LastName;
        }
        if (TypeUtils.hasProperty(inputModel, 'Phone')) {
            updateModel.Phone = inputModel.Phone;
        }
        if (TypeUtils.hasProperty(inputModel, 'Email')) {
            updateModel.Email = inputModel.Email;
        }
        if (TypeUtils.hasProperty(inputModel, 'ProfileImageUrl')) {
            updateModel.ImageUrl = inputModel.ProfileImageUrl;
        }
        if (TypeUtils.hasProperty(inputModel, 'Gender')) {
            updateModel.Gender = inputModel.Gender;
        }
        if (TypeUtils.hasProperty(inputModel, 'BirthDate')) {
            updateModel.BirthDate = inputModel.BirthDate;
        }

        return updateModel;
    };

    createUserLoginSession = async (userId: uuid) => {
        const tracer = trace.getTracer(getServiceName());
        return tracer.startActiveSpan('DbAccess:UserService:createUserLoginSession', async (span) => {
        try {
            var now = new Date();
            var till = TimeUtils.addDuration(now, 3, DurationType.Day);
            var user = await this._userRepository.findOne({
                where : {
                    id : userId
                }
            });
            if (!user) {
                ErrorHandler.throwNotFoundError('User not found!');
            }
            var session = await this._userLoginSessionRepository.create({
                User      : user,
                IsActive  : true,
                StartedAt : now,
                ValidTill : till
            });
            var record = await this._userLoginSessionRepository.save(session);
            span.end();
            return record;
        } catch (error) {
            span.recordException(error);
            ErrorHandler.throwDbAccessError('Unable to create user login session!', error);
        }
    });
    };

    invalidateUserLoginSession = async (sessionId) => {
        try {
            var session = await this._userLoginSessionRepository.findOne({
                where : {
                    id : sessionId
                }
            });
            if (!session) {
                ErrorHandler.throwNotFoundError('User login session not found!');
            }
            session.IsActive = false;
            session.ValidTill = new Date();
            var record = await this._userLoginSessionRepository.save(session);
            return record;
        } catch (error) {
            ErrorHandler.throwDbAccessError('Unable to invalidate user login session!', error);
        }
    };

    isValidUserLoginSession = async (sessionId) => {
        try {
            var session = await this._userLoginSessionRepository.findOne({
                where : {
                    id : sessionId
                }
            });
            if (session == null) {
                return false;
            }
            if (session.ValidTill < new Date()) {
                return false;
            }
            if (session.IsActive === false) {
                return false;
            }
            return true;
        } catch (error) {
            ErrorHandler.throwDbAccessError('Unable to determine validity of user login session!', error);
        }
    };

    resetPassword = async (userId: uuid, hashedPassword: string) => {
        try {
            var user = await this._userRepository.findOne({
                where : {
                    id : userId
                }
            });
            if (!user) {
                ErrorHandler.throwNotFoundError('User not found!');
            }
            user.Password = hashedPassword;
            return await this._userRepository.save(user);
        } catch (error) {
            ErrorHandler.throwDbAccessError('Unable to reset password!', error);
        }
    };

    validatePasswordCriteria = (password) => {
        var strength = passwordStrength(password);
        if (strength.length < 8 || strength.contains.length < 4) {
            //Criteria is min 8 characters and contains minimum diversities such as
            //'lowercase', 'uppercase', 'symbol', 'number'
            ErrorHandler.throwInputValidationError(['Password does not match security criteria!']);
        }
    };

}

