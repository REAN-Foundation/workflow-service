import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { XRule } from "./rule.types";
import { NodeType, QuestionResponseType } from "../engine.enums";
import { XAction } from "./action.types";
import { ActionInputParams } from "./params.types";

////////////////////////////////////////////////////////////////

export interface XQuestionOption {
    id?               : uuid;
    NodeId?           : uuid;
    Text              : string;
    ImageUrl?         : string;
    Sequence          : number;
    Metadata          : string;
}

export interface XNodePath {
    id            : uuid;
    Name          : string;
    Code          : string;
    ParentNodeId  : uuid;
    ParentNodeCode: string;
    NextNodeId    : uuid;
    NextNodeCode  : string;
    Rule          : XRule;
}

export interface XNode
{
    id              : uuid;
    Name            : string;
    Code            : string;
    Description     : string;
    SchemaId        : uuid;
    Type            : NodeType;
    ParentNodeId   ?: uuid;
    ParentNodeCode ?: string;
    RawData         : any;
    ChildrenNodeIds : uuid[];
    Actions        ?: XAction[];
}

export type XExecutionNode = XNode;

export interface XQuestionNode extends XNode {
    QuestionText    : string;
    ResponseType    : QuestionResponseType;
    Options        ?: XQuestionOption[];
    DefaultPathId  ?: uuid;
    DefaultOptionId?: uuid;
    Paths          ?: XNodePath[];
}

export interface XQuestionNodeResponse {
    id              : uuid;
    NodeId          : uuid;
    Node            : XQuestionNode;
    SchemaId        : uuid;
    SchemaInstanceId: uuid;
    ResponseType    : QuestionResponseType;
    SatisfiedConditionId: uuid;
    ChosenOptionId  : uuid;
    ChosenOptionSequence: number;
    ChosenPathId    : uuid;
    Response        : {
        IntegerValue?        : number;
        FloatValue?          : number;
        TextValue?           : string;
        BooleanValue?        : boolean;
        DateValue?           : Date;
        Url?                 : string;
        ResourceId?          : uuid;
        ArrayValue?          : number[];
        ObjectValue?         : any;
    };
    CreatedAt       : Date;
}

export interface XListeningNode extends XNode {
    Input : ActionInputParams;
}

export interface XYesNoNode extends XNode {
    DecisionRuleId: uuid;
    DecisionRule  : XRule;
}

export interface XWaitNode extends XNode {
    ExecutionDelaySeconds : number;
    ExecutionRuleId      ?: uuid;
    ExecutionRule        ?: XRule;
}

export interface XNodeInstance {
    id              : uuid;
    NodeId          : uuid;
    SchemaInstanceId: uuid;
    Executed        : boolean;
    CreatedAt       : Date;
    UpdatedAt       : Date;
}
