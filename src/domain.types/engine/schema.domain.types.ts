import { EventType } from "../enums/event.type";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { EventActionType, InputParams, NodeType, OutputParams, SchemaType } from "./engine.types";
import { NodeCreateModel } from "./node.domain.types";

//////////////////////////////////////////////////////////////

export interface SchemaCreateModel {
    ClientId     : uuid;
    Name         : string;
    Description? : string;
    Type         : SchemaType;
    ValidFrom   ?: Date;
    ValidTill   ?: Date;
    IsValid     ?: boolean;
    EventTypeIds?: uuid[];
    RootNode    ?: NodeCreateModel;
    IdentificationParams?: Map<string, any>;
}

export interface SchemaUpdateModel {
    ClientId?    : uuid;
    Name?        : string;
    Description? : string;
    Type        ?: SchemaType;
    ValidFrom   ?: Date;
    ValidTill   ?: Date;
    IsValid     ?: boolean;
    EventTypeIds?: uuid[];
    IdentificationParams?: Map<string, any>;
}

export interface SchemaResponseDto {
    id         : uuid;
    Name       : string;
    Description: string;
    Type       : SchemaType;
    ValidFrom  : Date;
    ValidTill  : Date;
    IsValid    : boolean;
    RootNode  ?: {
       id         : uuid,
       Name       : string;
       Description: string;
       Type       : NodeType;
        Action ?  : {
            ActionType  : EventActionType;
            Name        : string;
            Description : string;
            InputParams : InputParams;
            OutputParams: OutputParams;
        }
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
