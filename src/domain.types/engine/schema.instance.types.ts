import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType } from "./engine.enums";
import { Almanac, ContextParams } from "./intermediate.types/intermediate.types";

//////////////////////////////////////////////////////////////

export interface SchemaInstanceCreateModel {
    SchemaId     : uuid;
    TenantId     : uuid;
    ContextParams: ContextParams;
    Code        ?: string;
}

export interface SchemaInstanceUpdateModel {
    ContextParams : ContextParams;
}

export interface SchemaInstanceResponseDto {
    id         : uuid;
    Code       : string;
    TenantId   : uuid;
    Schema     : {
        id         : uuid;
        Name       : string;
        Description: string;
        TenantId   : uuid;
    };
    ContextParams ?: ContextParams;
    RootNodeInstance : {
        id: uuid;
        Node: {
            id: uuid;
            Name: string;
        }
    };
    CurrentNodeInstance : {
        id: uuid;
        Node: {
            id: uuid;
            Name: string;
            Type: NodeType;
        }
    };
    NodeInstances : {
        id: uuid;
        Node: {
            id: uuid;
            Name: string;
            Type: NodeType;
            Active?: boolean;
        }
    }[];
    Almanac: Almanac;
    ExecutionStarted: boolean;
    ExecutionStartedTimestamp: Date;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface SchemaInstanceSearchFilters extends BaseSearchFilters {
    SchemaId  ?: uuid;
    TenantId  ?: uuid;
    Code      ?: string;
}

export interface SchemaInstanceSearchResults extends BaseSearchResults {
    Items: SchemaInstanceResponseDto[];
}
