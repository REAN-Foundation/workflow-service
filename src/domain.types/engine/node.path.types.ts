import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";

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
    Description? : string;
    ParentNodeId : uuid;
    SchemaId     : uuid;
}

export interface NodePathUpdateModel {
    Name        ?: string;
    Description ?: string;
    ParentNodeId?: uuid;
    SchemaId    ?: uuid;
}

export interface NodePathResponseDto {
    id         : uuid;
    Name       : string;
    Description: string;
    ParentNode : {
        id: uuid;
        Name: string;
        Description: string;
    }
    Rule  : {
        id: uuid;
        Name: string;
        Description: string;
    };
    NextNode   : {
        id  : uuid;
        Name: string;
        Description: string;
    };
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface NodePathSearchFilters extends BaseSearchFilters {
    Name         ?: string;
    ParentNodeId ?: uuid;
    SchemaId     ?: uuid;
}

export interface NodePathSearchResults extends BaseSearchResults {
    Items: NodePathResponseDto[];
}
