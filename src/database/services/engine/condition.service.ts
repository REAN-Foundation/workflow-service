import { Condition } from '../../models/engine/condition.model';
import { Rule } from '../../models/engine/rule.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { ConditionMapper } from '../../mappers/engine/condition.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    ConditionCreateModel,
    ConditionResponseDto,
    ConditionSearchFilters,
    ConditionSearchResults,
    ConditionUpdateModel
} from '../../../domain.types/engine/condition.types';

///////////////////////////////////////////////////////////////////////

export class ConditionService extends BaseService {

    //#region Repositories

    _conditionRepository: Repository<Condition> = Source.getRepository(Condition);

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    //#endregion

    public create = async (createModel: ConditionCreateModel)
        : Promise<ConditionResponseDto> => {

        const condition = this._conditionRepository.create({
            Name                    : createModel.Name,
            Description             : createModel.Description,
            ParentRuleId            : createModel.ParentRuleId,
            ParentConditionId       : createModel.ParentConditionId,
            ParentNodeId            : createModel.ParentNodeId,
            NodePathId              : createModel.NodePathId,
            OperatorType            : createModel.OperatorType,
            LogicalOperatorType     : createModel.LogicalOperatorType,
            CompositionOperatorType : createModel.CompositionOperatorType,
            FirstOperand            : createModel.FirstOperand,
            SecondOperand           : createModel.SecondOperand,
            ThirdOperand            : createModel.ThirdOperand,
        });
        var record = await this._conditionRepository.save(condition);
        return ConditionMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<ConditionResponseDto> => {
        try {
            var condition = await this._conditionRepository.findOne({
                where : {
                    id : id
                }
            });
            return ConditionMapper.toResponseDto(condition);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getChildrenConditions = async (conditionId: uuid): Promise<ConditionResponseDto[]> => {
        try {
            var conditions = await this._conditionRepository.find({
                where : {
                    ParentConditionId : conditionId
                }
            });
            return conditions.map(x => ConditionMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getConditionsForRule = async (ruleId: uuid): Promise<ConditionResponseDto[]> => {
        try {
            var conditions = await this._conditionRepository.find({
                where : {
                    ParentRuleId : ruleId
                }
            });
            return conditions.map(x => ConditionMapper.toResponseDto(x));
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: ConditionSearchFilters)
        : Promise<ConditionSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._conditionRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => ConditionMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: ConditionUpdateModel)
        : Promise<ConditionResponseDto> => {
        try {
            const condition = await this._conditionRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!condition) {
                ErrorHandler.throwNotFoundError('Condition not found!');
            }
            if (model.ParentRuleId != null) {
                condition.ParentRuleId = model.ParentRuleId;
            }
            if (model.ParentConditionId != null) {
                condition.ParentConditionId = model.ParentConditionId;
            }
            if (model.Name != null) {
                condition.Name = model.Name;
            }
            if (model.Description != null) {
                condition.Description = model.Description;
            }
            if (model.NodePathId != null) {
                condition.NodePathId = model.NodePathId;
            }
            if (model.ParentNodeId != null) {
                condition.ParentNodeId = model.ParentNodeId;
            }
            if (model.OperatorType != null) {
                condition.OperatorType = model.OperatorType;
            }
            if (model.LogicalOperatorType != null) {
                condition.LogicalOperatorType = model.LogicalOperatorType;
            }
            if (model.CompositionOperatorType != null) {
                condition.CompositionOperatorType = model.CompositionOperatorType;
            }
            if (model.FirstOperand != null) {
                condition.FirstOperand = model.FirstOperand;
            }
            if (model.SecondOperand != null) {
                condition.SecondOperand = model.SecondOperand;
            }
            if (model.ThirdOperand != null) {
                condition.ThirdOperand = model.ThirdOperand;
            }
            var record = await this._conditionRepository.save(condition);
            return ConditionMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._conditionRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._conditionRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: ConditionSearchFilters) => {

        var search : FindManyOptions<Condition> = {
            relations : {
            },
            where : {
            }
        };

        if (filters.ParentRuleId) {
            search.where['ParentRuleId'] = filters.ParentRuleId;
        }
        if (filters.ParentConditionId) {
            search.where['ParentConditionId'] = filters.ParentConditionId;
        }
        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
        }

        return search;
    };

    //#endregion

    // private async getRule(ruleId: uuid) {
    //     if (!ruleId) {
    //         return null;
    //     }
    //     const rule = await this._ruleRepository.findOne({
    //         where : {
    //             id : ruleId
    //         }
    //     });
    //     if (!rule) {
    //         ErrorHandler.throwNotFoundError('Rule cannot be found');
    //     }
    //     return rule;
    // }

    // private async getCondition(conditionId: uuid) {
    //     if (!conditionId) {
    //         return null;
    //     }
    //     const condition = await this._conditionRepository.findOne({
    //         where : {
    //             id : conditionId
    //         }
    //     });
    //     if (!condition) {
    //         ErrorHandler.throwNotFoundError('Condition cannot be found');
    //     }
    //     return condition;
    // }

}
