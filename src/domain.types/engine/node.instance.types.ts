import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { ExecutionStatus, NodeType } from "./engine.enums";

//////////////////////////////////////////////////////////////

export interface NodeInstanceCreateModel {
    NodeId          : uuid;
    SchemaInstanceId: uuid;
    ExecutionStatus : ExecutionStatus;
}

export interface NodeInstanceUpdateModel {
    NodeId           ?: uuid;
    SchemaInstanceId ?: uuid;
}

export interface NodeInstanceResponseDto {
    id         : uuid;
    ExecutionStatus : ExecutionStatus;
    StatusUpdateTimestamp : Date;
    ExecutionResult      : any;
    Node                 : {
        id    : uuid;
        Type  : NodeType;
        Name  : string;
    };
    SchemaInstance : {
        id    : uuid;
        Schema: {
            id         : uuid;
            Name       : string;
            Description: string;
        };
    };
    ParentNodeInstance : {
        id: uuid;
        Node: {
            id: uuid;
            Name: string;
        };
    } | null;
    ChildrenNodeInstances : {
        id  : uuid;
        Node: {
            id: uuid;
            Name: string;
        };
    }[];
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface NodeInstanceSearchFilters extends BaseSearchFilters {
    NodeId           ?: uuid;
    SchemaInstanceId ?: uuid;
}

export interface NodeInstanceSearchResults extends BaseSearchResults {
    Items: NodeInstanceResponseDto[];
}
