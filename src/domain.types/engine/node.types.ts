import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType } from "./engine.enums";
import { XAction, XQuestionOption } from "./intermediate.types";

//////////////////////////////////////////////////////////////

export interface NodeCreateModel {
    Type                  : NodeType;
    Name                  : string;
    Description?          : string;
    ParentNodeId          : uuid;
    SchemaId              : uuid;
    Actions              ?: XAction[];
    ExecutionDelaySeconds?: number;
    ExecutionRuleId      ?: uuid;
}

export interface QuestionNodeCreateModel extends NodeCreateModel {
    Question : string;
    Options  : XQuestionOption[];
}

export interface NodeUpdateModel {
    Type                 ?: NodeType;
    Name                 ?: string;
    Description          ?: string;
    ParentNodeId         ?: uuid;
    SchemaId             ?: uuid;
    Actions              ?: XAction[];
    ExecutionDelaySeconds?: number;
    ExecutionRuleId      ?: uuid;
}

export interface NodeResponseDto {
    id         : uuid;
    Type       : NodeType;
    Name       : string;
    Description: string;
    ParentNode : {
        id         : uuid;
        Name       : string;
        Description: string;
    }
    Children     : {
        id         : uuid;
        Name       : string;
        Description: string;
    }[];
    Schema     : {
        id         : uuid;
        Name       : string;
        Description: string;
    };
    Question?             : string;
    Options?              : XQuestionOption[];
    ExecutionDelaySeconds?: number;
    ExecutionRuleId?      : uuid;
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
