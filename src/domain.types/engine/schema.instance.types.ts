import { AlmanacObject } from "../../modules/engine.execution/almanac";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType } from "./engine.enums";
import { ContextParams } from "./intermediate.types/params.types";

//////////////////////////////////////////////////////////////

export interface SchemaInstanceCreateModel {
    SchemaId               : uuid;
    TenantId               : uuid;
    ContextParams          : ContextParams;
    Code                  ?: string;
    ParentSchemaInstanceId?: uuid;
}

export interface SchemaInstanceUpdateModel {
    ContextParams          : ContextParams;
    ParentSchemaInstanceId?: uuid;
}

export interface SchemaInstanceResponseDto {
    id                     : uuid;
    Code                   : string;
    TenantId               : uuid;
    ParentSchemaInstanceId?: uuid;
    Schema                 : {
        id         : uuid;
        Name       : string;
        Description: string;
        TenantId   : uuid;
    };
    ContextParams   ?: ContextParams;
    RootNodeInstance : {
        id  : uuid;
        Node: {
            id  : uuid;
            Name: string;
            Type: NodeType;
        }
    };
    CurrentNodeInstance : {
        id  : uuid;
        Node: {
            id  : uuid;
            Name: string;
            Type: NodeType;
        }
    };
    NodeInstances : {
        id  : uuid;
        Node: {
            id     : uuid;
            Name   : string;
            Type   : NodeType;
            Active?: boolean;
        }
    }[];
    AlmanacObjects           : AlmanacObject[];
    ExecutionStarted         : boolean;
    ExecutionStartedTimestamp: Date;
    CreatedAt                : Date;
    UpdatedAt                : Date;
}

export interface SchemaInstanceSearchFilters extends BaseSearchFilters {
    SchemaId              ?: uuid;
    TenantId              ?: uuid;
    Code                  ?: string;
    ParentSchemaInstanceId?: uuid;
}

export interface SchemaInstanceSearchResults extends BaseSearchResults {
    Items: SchemaInstanceResponseDto[];
}
