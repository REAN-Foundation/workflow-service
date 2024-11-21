import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { XAction } from "./action.types";
import { NodeType } from "./engine.enums";

//////////////////////////////////////////////////////////////

export interface NodeCreateModel {
    Type         : NodeType;
    Name         : string;
    Description? : string;
    ParentNodeId : uuid;
    SchemaId     : uuid;
    Actions     ?: XAction[];
}

export interface NodeUpdateModel {
    Type        ?: NodeType;
    Name        ?: string;
    Description ?: string;
    ParentNodeId?: uuid;
    SchemaId    ?: uuid;
    Actions     ?: XAction[];
}

export interface NodeResponseDto {
    id         : uuid;
    Type       : NodeType;
    Name       : string;
    Description: string;
    ParentNode : {
        id: uuid;
        Name: string;
        Description: string;
    }
    Children     : {
        id  : uuid;
        Name: string;
        Description: string;
    }[];
    Schema     : {
        id  : uuid;
        Name: string;
        Description: string;
    };
    Rules : {
        id: uuid;
        Name: string;
        Description: string;
    }[];

    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface NodeSearchFilters extends BaseSearchFilters {
    Type         ?: NodeType;
    Name         ?: string;
    ParentNodeId ?: uuid;
    SchemaId     ?: uuid;
}

export interface NodeSearchResults extends BaseSearchResults {
    Items: NodeResponseDto[];
}
