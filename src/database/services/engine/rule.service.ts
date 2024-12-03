import { Rule } from '../../models/engine/rule.model';
import { Node } from '../../models/engine/node.model';
import { Condition } from '../../models/engine/condition.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { RuleMapper } from '../../mappers/engine/rule.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    RuleCreateModel,
    RuleResponseDto,
    RuleSearchFilters,
    RuleSearchResults,
    RuleUpdateModel } from '../../../domain.types/engine/rule.domain.types';
import { CompositionOperatorType, OperatorType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////

export class RuleService extends BaseService {

    //#region Repositories

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _conditionRepository: Repository<Condition> = Source.getRepository(Condition);

    //#endregion

    public create = async (createModel: RuleCreateModel)
        : Promise<RuleResponseDto> => {

        const parentNode = await this.getNode(createModel.ParentNodeId);

        const rule = this._ruleRepository.create({
            ParentNode  : parentNode,
            Name        : createModel.Name,
            Description : createModel.Description,
        });
        var record = await this._ruleRepository.save(rule);

        const condition = await this._conditionRepository.create({
            Name                : `Rule-${rule.Name}-RootCondition`,
            Rule                : record,
            Operator            : OperatorType.Composition,
            CompositionOperator : CompositionOperatorType.And,
        });
        var conditionRecord = await this._conditionRepository.save(condition);

        rule.Condition = conditionRecord;
        record = await this._ruleRepository.save(rule);

        return RuleMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<RuleResponseDto> => {
        try {
            var rule = await this._ruleRepository.findOne({
                where : {
                    id : id
                },
                select : {
                    id          : true,
                    Name        : true,
                    Description : true,
                    ParentNode  : {
                        id          : true,
                        Name        : true,
                        Description : true,
                    },
                    Condition : {
                        id       : true,
                        Name     : true,
                        Operator : true,
                    },
                    CreatedAt : true,
                    UpdatedAt : true,
                }
            });
            return RuleMapper.toResponseDto(rule);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: RuleSearchFilters)
        : Promise<RuleSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._ruleRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => RuleMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: RuleUpdateModel)
        : Promise<RuleResponseDto> => {
        try {
            const rule = await this._ruleRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!rule) {
                ErrorHandler.throwNotFoundError('Rule not found!');
            }
            if (model.ParentNodeId != null) {
                const node = await this.getNode(model.ParentNodeId);
                rule.ParentNode = node;
            }
            if (model.Name != null) {
                rule.Name = model.Name;
            }
            if (model.Description != null) {
                rule.Description = model.Description;
            }
            var record = await this._ruleRepository.save(rule);
            return RuleMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._ruleRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._ruleRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: RuleSearchFilters) => {

        var search : FindManyOptions<Rule> = {
            relations : {
            },
            where : {
            },
            select : {
                id          : true,
                Name        : true,
                Description : true,
                ParentNode  : {
                    id          : true,
                    Name        : true,
                    Description : true,
                },
                Condition : {
                    id       : true,
                    Name     : true,
                    Operator : true,
                },
                CreatedAt : true,
                UpdatedAt : true,
            }
        };

        if (filters.ParentNodeId) {
            search.where['ParentNode'].id = filters.ParentNodeId;
        }
        if (filters.ConditionId) {
            search.where['Condition'].id = filters.ConditionId;
        }
        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
        }

        return search;
    };

    //#endregion

    private async getNode(nodeId: uuid) {
        if (!nodeId) {
            return null;
        }
        const node = await this._nodeRepository.findOne({
            where : {
                id : nodeId
            }
        });
        if (!node) {
            ErrorHandler.throwNotFoundError('Node cannot be found');
        }
        return node;
    }

}
