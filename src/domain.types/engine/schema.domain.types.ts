import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType, SchemaType } from "./engine.enums";
import { ContextParams } from "./intermediate.types";
import { NodeActionResponseDto } from "./node.action.types";
import { NodeCreateModel } from "./node.types";

//////////////////////////////////////////////////////////////

export interface SchemaCreateModel {
    TenantId      : uuid;
    Type          : SchemaType;
    Name          : string;
    Description?  : string;
    RootNode     ?: NodeCreateModel;
    ContextParams?: ContextParams;
}

export interface SchemaUpdateModel {
    Type?        : SchemaType;
    Name?        : string;
    Description? : string;
    ContextParams?: ContextParams;
}

export interface SchemaResponseDto {
    id          : uuid;
    Type        : SchemaType;
    TenantId    : uuid;
    Name        : string;
    Description : string;
    RootNode   ?: {
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
    Name?        : string;
    Description? : string;
    TenantId ?   : uuid;
}

export interface SchemaSearchResults extends BaseSearchResults {
    Items: SchemaResponseDto[];
}
