import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType, SchemaType } from "./engine.enums";
import { ContextParams } from "./params.types";
import { NodeActionResponseDto } from "./node.action.types";
import { NodeCreateModel } from "./node.types";

//////////////////////////////////////////////////////////////

export interface SchemaCreateModel {
    TenantId           : uuid;
    TenantCode         : string;
    Type               : SchemaType;
    Name               : string;
    Description?       : string;
    RootNode          ?: NodeCreateModel;
    ExecuteImmediately?: boolean;
    ContextParams     ?: ContextParams;
    ParentSchemaId    ?: uuid;
}

export interface SchemaUpdateModel {
    Type?              : SchemaType;
    Name?              : string;
    Description?       : string;
    ParentSchemaId?    : uuid;
    ExecuteImmediately?: boolean;
    ContextParams     ?: ContextParams;
}

export interface SchemaResponseDto {
    id                 : uuid;
    Type               : SchemaType;
    TenantId           : uuid;
    TenantCode         : string;
    Name               : string;
    Description        : string;
    ParentSchemaId    ?: uuid;
    ExecuteImmediately?: boolean;
    RootNode          ?: {
       id         : uuid,
       Name       : string;
       Description: string;
       Type       : NodeType;
       Actions    : NodeActionResponseDto[];
       NextNodeId : uuid;
    };
    ContextParams?: ContextParams;
    CreatedAt     : Date;
    UpdatedAt     : Date;
}

export interface SchemaSearchFilters extends BaseSearchFilters {
    Name?          : string;
    Description?   : string;
    TenantId      ?: uuid;
    ParentSchemaId?: uuid;
}

export interface SchemaSearchResults extends BaseSearchResults {
    Items: SchemaResponseDto[];
}
