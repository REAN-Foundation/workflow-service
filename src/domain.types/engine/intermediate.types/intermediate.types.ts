/* eslint-disable lines-between-class-members */
import { StringUtils } from "../../../common/utilities/string.utils";
import { uuid } from "../../miscellaneous/system.types";
import {
    CompositionOperator,
    UserMessageType,
    NodeType,
    OperandDataType,
    OperatorType,
    QuestionResponseType,
    SchemaType
} from "../engine.enums";
import { XAction } from "./action.types";
import { Almanac } from "./almanac";
import { ActionInputParams, ContextParams } from "./params.types";

////////////////////////////////////////////////////////////////

export interface QuestionResponseMessage {
    QuestionId          ?: uuid;
    QuestionText        ?: string;
    QuestionOptions     ?: XQuestionOption[];
    ChosenOption        ?: string;
    ChosenOptionSequence?: number;
    PreviousMessageId   ?: uuid;
    PreviousNodeId      ?: uuid;
}

export interface UserMessageEvent {
    Phone?           : string;
    EventTimestamp   : Date;
    MessageType      : UserMessageType;
    MessageChannel   : MessageChannel;
    TextMessage     ?: string;
    ImageUrl        ?: string;
    AudioUrl        ?: string;
    VideoUrl        ?: string;
    Location        ?: Location;
    QuestionResponse?: QuestionResponseMessage;
}

export class XConditionOperand {

    DataType?: OperandDataType;

    Name ?   : string | null;

    Value?   : string | number | boolean | any[] | null;

    constructor(
        dataType: OperandDataType,
        name: string | null,
        value: string | number | boolean | any[] | null) {
        this.DataType = dataType;
        this.Name = name;
        this.Value = value;

        if (StringUtils.isStr(this.Value) && this.DataType !== OperandDataType.Text) {
            if (this.DataType === OperandDataType.Integer) {
                this.Value = parseInt(this.Value as string);
            }
            if (this.DataType === OperandDataType.Float) {
                this.Value = parseFloat(this.Value as string);
            }
            if (this.DataType === OperandDataType.Boolean) {
                this.Value = parseInt(this.Value as string);
                if (this.Value === 0) {
                    this.Value = false;
                }
                else {
                    this.Value = true;
                }
            }
            if (this.DataType === OperandDataType.Array) {
                this.Value = JSON.parse(this.Value as string);
            }
        }
    }

}

export interface XCondition {
    id            : uuid;
    Name          : string;
    Code          : string;
    PathId        : uuid;
    ParentNodeId  : uuid;
    ParentNodeCode: string;

    IsCompositeCondition?: boolean;
    CompositionType?     : CompositionOperator;
    ParentConditionId?   : uuid;
    OperatorType?        : OperatorType;

    FirstOperand ?: XConditionOperand;
    SecondOperand?: XConditionOperand;
    ThirdOperand ?: XConditionOperand;

    Children?     : XCondition[];
}

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

export interface XRule {
    id          : uuid;
    Name        : string;
    Description : string;
    ParentNodeId: uuid;
    Condition   : XCondition;
    NodePathId ?: uuid;
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

export interface XSchema {
    id          : uuid;
    Type        : SchemaType;
    Name        : string;
    Description : string;
    Active      : boolean;
    RootNode   ?: XNode;
    Tenant      : {
        id  : uuid;
        Name: string;
        Code: string;
    };
    Nodes        : XNode[];
    ContextParams: ContextParams;
    CreatedAt    : Date;
    UpdatedAt    : Date;
}

export interface XNodeInstance {
    NodeId          : uuid;
    SchemaInstanceId: uuid;
    Executed        : boolean;
    CreatedAt       : Date;
    UpdatedAt       : Date;
}

export interface XSchemaInstance {
    id                  : uuid;
    SchemaId            : uuid;
    Schema              : XSchema;
    Name                : string;
    Description         : string;
    Exited              : boolean;
    RootNode           ?: XNode;
    RootNodeInstance    : XNodeInstance;
    TenantId           ?: uuid;
    Nodes               : XNode[];
    NodeInstances       : XNodeInstance[];
    CurrentNodeInstance : XNodeInstance;
    ContextParams       : ContextParams;
    ActiveListeningNodes: XNodeInstance[];
    Almanac             : Almanac;
    CurrentNode         : XNode;
    CreatedAt           : Date;
    UpdatedAt           : Date;
}

export interface ProcessorResult {
    Success: boolean;
    Tag    : string;
    Data   : any[] | any;
}

export enum DataSamplingMethod {
    Any     = "Any",
    All     = "All",
    Average = "Average",
}

export const DataSamplingMethodList: DataSamplingMethod[] = [
    DataSamplingMethod.Any,
    DataSamplingMethod.All,
    DataSamplingMethod.Average,
];
