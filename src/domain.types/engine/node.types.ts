import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { NodeType, QuestionResponseType } from "./engine.enums";
import { XAction } from "./intermediate.types/action.types";
import { XConditionOperand, XQuestionOption } from "./intermediate.types/intermediate.types";
import { ActionInputParams } from "./intermediate.types/params.types";
import { NodeActionResponseDto } from "./node.action.types";

//////////////////////////////////////////////////////////////

export interface NodeCreateModel {
    Type                  : NodeType;
    Name                  : string;
    Description?          : string;
    ParentNodeId          : uuid;
    SchemaId              : uuid;
    Actions              ?: XAction[];
    RawData              ?: any;
}

export interface QuestionNodeCreateModel extends NodeCreateModel {
    QuestionText : string;
    ResponseType : QuestionResponseType;
    Options      : XQuestionOption[];
}

export interface ListeningNodeCreateModel extends NodeCreateModel {
    Input : ActionInputParams;
}

export interface YesNoNodeCreateModel extends NodeCreateModel {
    //These are the actions executed before the evaluation of the decision rule
    PreEvaluationActions : NodeActionResponseDto[];
    //Once the actions are executed, the input operands are calculated and stored
    InputOperandValues : XConditionOperand[];
    //The decision rule is evaluated based on the input operands.
    //Input operands are identified by their names in the decision rule
    DecisionRuleId : uuid;
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
    RawData              ?: any;
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
        ResponseType  : QuestionResponseType;
        QuestionText? : string;
        Options?      : XQuestionOption[];
    },
    ExecutionDelaySeconds?: number;
    ExecutionRuleId?      : uuid;
    RawData?              : any;
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
