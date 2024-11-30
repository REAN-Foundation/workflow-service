import { Schema } from '../../models/engine/schema.model';
import { Client } from '../../models/client/client.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { SchemaMapper } from '../../mappers/engine/schema.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    SchemaCreateModel,
    SchemaResponseDto,
    SchemaSearchFilters,
    SchemaSearchResults,
    SchemaUpdateModel } from '../../../domain.types/engine/schema.domain.types';
import { Rule } from '../../models/engine/rule.model';
import { Node } from '../../models/engine/node.model';
import { Condition } from '../../models/engine/condition.model';
import { CommonUtilsService } from './common.utils.service';
import { NodeAction } from '../../models/engine/node.action.model';
import { StringUtils } from '../../../common/utilities/string.utils';
import { NodeType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////

export class SchemaService extends BaseService {

    //#region Repositories

    _schemaRepository: Repository<Schema> = Source.getRepository(Schema);

    _actionRepository: Repository<NodeAction> = Source.getRepository(NodeAction);

    _clientRepository: Repository<Client> = Source.getRepository(Client);

    _nodeRepository: Repository<Node> = Source.getRepository(Node);

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    _conditionRepository: Repository<Condition> = Source.getRepository(Condition);

    _commonUtils: CommonUtilsService = new CommonUtilsService();

    //#endregion

    public create = async (createModel: SchemaCreateModel)
        : Promise<SchemaResponseDto> => {

        const rootNodeName = 'RootNode-' + createModel.Name.substring(0, 25);
        let rootNode: Node = null;
        if (createModel.RootNode) {
            rootNode = this._nodeRepository.create({
                Code        : StringUtils.generateDisplayCode_RandomChars(12, 'ENODE'),
                ParentNode  : null,
                Name        : createModel.RootNode.Name,
                Type        : createModel.RootNode.Type,
                Description : createModel.RootNode.Description,
            });
        }
        else {
            rootNode = await this._nodeRepository.create({
                Code        : StringUtils.generateDisplayCode_RandomChars(12, 'ENODE'),
                Name        : rootNodeName,
                ParentNode  : null,
                Description : `Root node for ${createModel.Name}`,
                Type        : NodeType.ExecutionNode,
            });
        }
        if (rootNode == null) {
            ErrorHandler.throwInternalServerError('Unable to create Root Node!');
        }
        var rootNodeRecord = await this._nodeRepository.save(rootNode);

        if (createModel.RootNode.Actions) {
            for (var action of createModel.RootNode.Actions) {
                var actionRecord = await this._actionRepository.create({
                    ParentNode : rootNodeRecord,
                    Type       : action.Type,
                    Name       : action.Name,
                    Input      : action.Input,
                    Output     : action.Output,
                });
                await this._actionRepository.save(actionRecord);
            }
        }

        const schema = await this._schemaRepository.create({
            TenantId      : createModel.TenantId,
            Name          : createModel.Name,
            Description   : createModel.Description,
            Type          : createModel.Type,
            RootNodeId    : rootNodeRecord.id,
            ContextParams : createModel.ContextParams,
        });
        var schemaRecord = await this._schemaRepository.save(schema);

        rootNode.Schema = schemaRecord;
        rootNodeRecord = await this._nodeRepository.save(rootNode);

        var node = await this._nodeRepository.findOne({
            where : {
                id : rootNodeRecord.id
            },
            relations : {
                Actions : true
            }
        });

        return SchemaMapper.toResponseDto(schemaRecord, node);
    };

    public getById = async (id: uuid): Promise<SchemaResponseDto> => {
        try {
            var schema = await this._schemaRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Nodes : true,
                }
            });
            const rootNode = await this._commonUtils.getNode(schema.RootNodeId);
            return SchemaMapper.toResponseDto(schema, rootNode);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: SchemaSearchFilters)
        : Promise<SchemaSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._schemaRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => SchemaMapper.toResponseDto(x, null)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: SchemaUpdateModel)
        : Promise<SchemaResponseDto> => {
        try {
            const schema = await this._schemaRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!schema) {
                ErrorHandler.throwNotFoundError('Schema not found!');
            }
            //Schema code is not modifiable
            //Use renew key to update ApiKey, ValidFrom and ValidTill

            if (model.Name != null) {
                schema.Name = model.Name;
            }
            if (model.Description != null) {
                schema.Description = model.Description;
            }
            if (model.Type != null) {
                schema.Type = model.Type;
            }
            if (model.ContextParams != null) {
                schema.ContextParams = model.ContextParams;
            }
            const rootNode = await this._commonUtils.getNode(schema.RootNodeId);
            var record = await this._schemaRepository.save(schema);
            return SchemaMapper.toResponseDto(record, rootNode);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._schemaRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._schemaRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getByTenantId = async (tenantId: uuid): Promise<SchemaResponseDto[]> => {
        try {
            var schemas = await this._schemaRepository.find({
                where : {
                    TenantId : tenantId
                },
                relations : {
                    Nodes : true,
                }
            });
            var dtos: SchemaResponseDto[] = [];
            for (var schema of schemas) {
                const rootNode = await this._commonUtils.getNode(schema.RootNodeId);
                var dto = SchemaMapper.toResponseDto(schema, rootNode);
                dtos.push(dto);
            }
            return dtos;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: SchemaSearchFilters) => {

        var search : FindManyOptions<Schema> = {
            relations : {
            },
            where : {
            }
        };

        if (filters.TenantId) {
            search.where['TenantId'] = filters.TenantId;
        }
        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
        }
        if (filters.Description) {
            search.where['Description'] = Like(`%${filters.Description}%`);
        }

        return search;
    };

    //#endregion

    // public readTemplateObjToExport = async (templateId: uuid): Promise<XSchema> => {
    //     var template = await this._assessmentHelperRepo.readTemplateAsObj(templateId);
    //     template = this.sanitizeTemplateForExport(template);
    //     return template;
    // };

    // public import = async (model: any): Promise<SchemaResponseDto> => {
    //     var template: XSchema = model as XSchema;
    //     return await this.addTemplate(template);
    // };

    // public addTemplate = async (template: CAssessmentTemplate): Promise<AssessmentTemplateDto> => {
    //     const resource = await AssessmentTemplateFileConverter.storeAssessmentTemplate(template);
    //     template.FileResourceId = resource.id;
    //     return await this._assessmentHelperRepo.addTemplate(template);
    // };

    // getNode = async (nodeId: string): Promise<any> => {
    //     return await this._assessmentHelperRepo.getNodeById(nodeId);
    // };

    // deleteNode = async (nodeId: string): Promise<boolean> => {
    //     return await this._assessmentHelperRepo.deleteNode(nodeId);
    // };

    // addNode = async (
    //     model: CAssessmentNode | CAssessmentListNode | CAssessmentQuestionNode | CAssessmentMessageNode) => {
    //     return await this._assessmentHelperRepo.createNode(model.TemplateId, model.ParentNodeId, model);
    // };

    // updateNode = async(nodeId: uuid, updates: any) => {
    //     return await this._assessmentHelperRepo.updateNode(nodeId, updates);
    // };

    // sanitizeTemplateForExport = (template: CAssessmentTemplate): CAssessmentTemplate => {

    //     delete template.TemplateId;

    //     for (var node of template.Nodes) {
    //         delete node.id;
    //         delete node.TemplateId;
    //         delete node.ParentNodeId;

    //         if (node.NodeType === AssessmentNodeType.NodeList) {
    //             delete (node as CAssessmentListNode).ChildrenNodeIds;
    //             delete (node as CAssessmentListNode).Children;
    //         }
    //         else if (node.NodeType === AssessmentNodeType.Question) {
    //             for (var option of (node as CAssessmentQuestionNode).Options) {
    //                 delete option.id;
    //                 delete option.NodeId;
    //             }
    //             for (var path of (node as CAssessmentQuestionNode).Paths) {
    //                 delete path.id;
    //                 delete path.ParentNodeId;
    //                 delete path.ConditionId;
    //                 delete path.NextNodeId;
    //             }
    //         }
    //         else if (node.NodeType === AssessmentNodeType.Message) {
    //             delete (node as CAssessmentMessageNode).Acknowledged;
    //         }
    //     }

    //     return template;
    // };

    // public searchNodes = async (filters: NodeSearchFilters): Promise<NodeSearchResults> => {
    //     return await this._assessmentHelperRepo.searchNodes(filters);
    // };

    // addPath = async (nodeId: uuid, path: XNodePath): Promise<XNodePath> => {
    //     return await this._assessmentHelperRepo.addPath(nodeId, path);
    // };

    // updatePath = async (pathId: uuid, updates: XNodePath): Promise<XNodePath> => {
    //     return await this._assessmentHelperRepo.updatePath(pathId, updates);
    // };

    // getPath = async (pathId: uuid): Promise<XNodePath> => {
    //     return await this._assessmentHelperRepo.getPath(pathId);
    // };

    // deletePath = async (pathId: uuid): Promise<boolean> => {
    //     return await this._assessmentHelperRepo.deletePath(pathId);
    // };

    // addPathCondition = async (pathId: uuid, condition: XPathCondition): Promise<XPathCondition> => {
    //     return await this._assessmentHelperRepo.addPathCondition(pathId, condition);
    // };

    // updatePathCondition = async (conditionId: uuid, updates: XPathCondition): Promise<XPathCondition> => {
    //     return await this._assessmentHelperRepo.updatePathCondition(conditionId, updates);
    // };

    // getPathCondition = async (conditionId: uuid, nodeId: uuid, pathId: uuid): Promise<XPathCondition> => {
    //     return await this._assessmentHelperRepo.getPathCondition(conditionId, nodeId, pathId);
    // };

    // deletePathCondition = async (conditionId: uuid): Promise<boolean> => {
    //     return await this._assessmentHelperRepo.deletePathCondition(conditionId);
    // };

    // getPathConditionForPath = async (pathId: uuid): Promise<XPathCondition> => {
    //     return await this._assessmentHelperRepo.getPathConditionForPath(pathId);
    // };

    // getNodePaths = async (nodeId: uuid): Promise<XNodePath[]> => {
    //     return await this._assessmentHelperRepo.getNodePaths(nodeId);
    // };

    // setNextNodeToPath = async (parentNodeId: uuid, pathId: uuid, nextNodeId: uuid): Promise<XNodePath> => {
    //     return await this._assessmentHelperRepo.setNextNodeToPath(parentNodeId, pathId, nextNodeId);
    // };

}
