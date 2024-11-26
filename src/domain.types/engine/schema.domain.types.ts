import { EventType } from "../enums/event.type";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType, SchemaType } from "./engine.enums";
import { ContextParams } from "./intermediate.types";
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
    ClientId?    : uuid;
    Type?        : SchemaType;
    Name?        : string;
    Description? : string;
    ValidFrom   ?: Date;
    ValidTill   ?: Date;
    IsValid     ?: boolean;
    EventTypeIds?: uuid[];
    ContextParams?: ContextParams;
}

export interface SchemaResponseDto {
    id         : uuid;
    Type       : SchemaType;
    Name       : string;
    Description: string;
    ValidFrom  : Date;
    ValidTill  : Date;
    IsValid    : boolean;
    RootNode  ?: {
       id         : uuid,
       Name       : string;
       Description: string;
       Type       : NodeType;
    };
    Client     : {
        id  : uuid;
        Name: string;
        Code: string;
    };
    EventTypes ?: EventType[];
    IdentificationParams?: Map<string, any>;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface SchemaSearchFilters extends BaseSearchFilters {
    Name ?     : string;
    ClientId ? : uuid;
}

export interface SchemaSearchResults extends BaseSearchResults {
    Items: SchemaResponseDto[];
}
