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
import { NodeResponseDto } from '../../../domain.types/engine/node.types';

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

        const client = await this._commonUtils.getClient(createModel.ClientId);

        const rootNodeName = 'Root Node' + createModel.Name.substring(0, 25);
        let rootNode: NodeResponseDto = null;
        if (createModel.RootNode) {
            rootNode = this._nodeRepository.create({
                ParentNode  : null,
                Name        : createModel.RootNode.Name,
                Type        : createModel.RootNode.Type,
                Description : createModel.RootNode.Description,
            });
        }
        else {
            rootNode = await this._nodeRepository.create({
                Name        : rootNodeName,
                ParentNode  : null,
                Description : `Root node for ${createModel.Name}`,
            });
        }
        var rootNodeRecord = await this._nodeRepository.save(rootNode);

        const schema = this._schemaRepository.create({
            Client      : client,
            Name        : createModel.Name,
            Description : createModel.Description,
            Type        : createModel.Type,
            ValidFrom   : createModel.ValidFrom,
            ValidTill   : createModel.ValidTill,
            IsValid     : createModel.IsValid ?? true,
            RootNodeId  : rootNodeRecord.id,
        });
        var schemaRecord = await this._schemaRepository.save(schema);

        rootNode.Schema = schemaRecord;
        rootNodeRecord = await this._nodeRepository.save(rootNode);

        return SchemaMapper.toResponseDto(schemaRecord, rootNodeRecord);
    };

    public getById = async (id: uuid): Promise<SchemaResponseDto> => {
        try {
            var schema = await this._schemaRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Client : true,
                    Nodes  : true,
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

            if (model.ClientId != null) {
                const client = await this._commonUtils.getClient(model.ClientId);
                schema.Client = client;
            }
            if (model.Name != null) {
                schema.Name = model.Name;
            }
            if (model.Description != null) {
                schema.Description = model.Description;
            }
            if (model.Type != null) {
                schema.Type = model.Type;
            }
            if (model.ValidFrom != null) {
                schema.ValidFrom = model.ValidFrom;
            }
            if (model.ValidTill != null) {
                schema.ValidTill = model.ValidTill;
            }
            if (model.IsValid != null) {
                schema.IsValid = model.IsValid;
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

    //#region Privates

    private getSearchModel = (filters: SchemaSearchFilters) => {

        var search : FindManyOptions<Schema> = {
            relations : {
            },
            where : {
            },
            select : {
                id     : true,
                Client : {
                    id   : true,
                    Name : true,
                    Code : true,
                },
                Name        : true,
                Description : true,
                ValidFrom   : true,
                ValidTill   : true,
                IsValid     : true,
                CreatedAt   : true,
                UpdatedAt   : true,
            }
        };

        if (filters.ClientId) {
            search.where['Client'].id = filters.ClientId;
        }
        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
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
