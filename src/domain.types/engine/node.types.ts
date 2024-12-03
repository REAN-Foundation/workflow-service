import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType, QuestionResponseType } from "./engine.enums";
import { XAction } from "./intermediate.types/action.types";
import { XQuestionOption } from "./intermediate.types/node.types";
import { ActionInputParams } from "./intermediate.types/params.types";
import { NodeActionCreateModel, NodeActionResponseDto } from "./node.action.types";

//////////////////////////////////////////////////////////////

export interface NodeCreateModel {
    Type                  : NodeType;
    Name                  : string;
    Description?          : string;
    ParentNodeId          : uuid;
    SchemaId              : uuid;
    Actions              ?: NodeActionCreateModel[];
    RawData              ?: any;
    DelaySeconds         ?: number;
    RuleId               ?: uuid;
    Input                ?: ActionInputParams;
}

export interface YesNoNodeCreateModel extends NodeCreateModel {
    YesAction : NodeActionCreateModel,
    NoAction  : NodeActionCreateModel,
}

export interface QuestionNodeCreateModel extends NodeCreateModel {
    QuestionText : string;
    ResponseType : QuestionResponseType;
    Options      : XQuestionOption[];
}

export interface NodeUpdateModel {
    Type        ?: NodeType;
    Name        ?: string;
    Description ?: string;
    ParentNodeId?: uuid;
    SchemaId    ?: uuid;
    Actions     ?: XAction[];
    DelaySeconds?: number;
    RuleId      ?: uuid;
    RawData     ?: any;
    Input       ?: ActionInputParams;
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
    Question ? : {
        ResponseType : QuestionResponseType;
        QuestionText?: string;
        Options?     : XQuestionOption[];
    },
    Actions      : NodeActionResponseDto[];
    YesAction   ?: NodeActionResponseDto;
    NoAction    ?: NodeActionResponseDto;
    DelaySeconds?: number;
    RuleId?      : uuid;
    RawData?     : any;
    Input?       : ActionInputParams;
    CreatedAt    : Date;
    UpdatedAt    : Date;
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
