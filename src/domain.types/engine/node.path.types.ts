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

// export interface XNodePath {
//     id            : uuid;
//     Name          : string;
//     Code          : string;
//     ParentNodeId  : NodeType;
//     ParentNodeCode: string;
//     NextNodeId    : uuid;
//     NextNodeCode  : string;
//     Condition     : XPathCondition;
// }

export interface NodePathCreateModel {
    Name         : string;
    Code         : string;
    Description? : string;
    ParentNodeId : uuid;
    SchemaId     : uuid;
}

export interface NodePathUpdateModel {
    Name        ?: string;
    Code        ?: string;
    Description ?: string;
    ParentNodeId?: uuid;
    SchemaId    ?: uuid;
}

export interface NodePathResponseDto {
    id         : uuid;
    Type       : NodeType;
    Name       : string;
    Code       : string;
    Description: string;
    ParentNode : {
        id: uuid;
        Name: string;
        Description: string;
    }
    Schema     : {
        id  : uuid;
        Name: string;
        Description: string;
    };
    
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface NodePathSearchFilters extends BaseSearchFilters {
    Type         ?: NodeType;
    Name         ?: string;
    ParentNodeId ?: uuid;
    SchemaId     ?: uuid;
}

export interface NodePathSearchResults extends BaseSearchResults {
    Items: NodePathResponseDto[];
}
