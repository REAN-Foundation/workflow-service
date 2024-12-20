import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { ActionType, ExecutionStatus, NodeType } from "./engine.enums";
import { ActionInputParams, ActionOutputParams } from "./params.types";
import { NodeActionResponseDto } from "./node.action.types";
import { NodeResponseDto } from "./node.types";

//////////////////////////////////////////////////////////////

export interface NodeInstanceCreateModel {
    Type            : NodeType;
    Input           : ActionInputParams;
    NodeId          : uuid;
    SchemaInstanceId: uuid;
    ExecutionStatus : ExecutionStatus;
}

export interface NodeInstanceUpdateModel {
    NodeId           ?: uuid;
    SchemaInstanceId ?: uuid;
}

export interface NodeInstanceResponseDto {
    id                   : uuid;
    ExecutionStatus      : ExecutionStatus;
    StatusUpdateTimestamp: Date;
    ExecutionResult      : any;
    Node                 : NodeResponseDto;
    SchemaInstance       : {
        id    : uuid;
        Schema: {
            id         : uuid;
            Name       : string;
            Description: string;
        };
    };
    ParentNodeInstance   : {
            id  : uuid;
            Node: {
                id  : uuid;
                Name: string;
            };
        } | null;
    ChildrenNodeInstances : {
            id  : uuid;
            Node: {
                id  : uuid;
                Name: string;
            };
        }[];
    ActionInstances?: NodeActionInstanceResponseDto[];
    CreatedAt       : Date;
    UpdatedAt       : Date;
}

export interface NodeInstanceSearchFilters extends BaseSearchFilters {
    NodeId           ?: uuid;
    SchemaInstanceId ?: uuid;
}

export interface NodeInstanceSearchResults extends BaseSearchResults {
    Items: NodeInstanceResponseDto[];
}

export interface NodeActionInstanceResponseDto {
    id                : uuid;
    ActionType        : ActionType;
    Sequence          : number;
    NodeId            : uuid;
    NodeInstanceId    : uuid;
    ActionId          : uuid;
    SchemaInstanceId  : uuid;
    Executed          : boolean;
    ExecutionTimestamp: Date;
    Input             : ActionInputParams;
    Output            : ActionOutputParams;
    Action           ?: NodeActionResponseDto;
    CreatedAt         : Date;
    UpdatedAt         : Date;
}
