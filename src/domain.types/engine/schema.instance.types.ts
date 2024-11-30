import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { ContextParams } from "./intermediate.types";

//////////////////////////////////////////////////////////////

export interface SchemaInstanceCreateModel {
    SchemaId  : uuid;
    ContextParams : ContextParams;
}

export interface SchemaInstanceUpdateModel {
    SchemaId  ?: uuid;
    ContextId ?: uuid;
}

export interface SchemaInstanceResponseDto {
    id         : uuid;
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
        }
    };
    NodeInstances : {
        id: uuid;
        Node: {
            id: uuid;
            Name: string;
        }
    }[];
    ExecutionStarted: boolean;
    ExecutionStartedTimestamp: Date;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface SchemaInstanceSearchFilters extends BaseSearchFilters {
    SchemaId  ?: uuid;
    ContextId ?: uuid;
}

export interface SchemaInstanceSearchResults extends BaseSearchResults {
    Items: SchemaInstanceResponseDto[];
}
