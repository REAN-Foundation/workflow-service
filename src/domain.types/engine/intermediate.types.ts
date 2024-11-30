/* eslint-disable lines-between-class-members */
import { StringUtils } from "../../common/utilities/string.utils";
import { uuid } from "../miscellaneous/system.types";
import {
    ActionType,
    CompositionOperator,
    InputSourceType,
    UserMessageType,
    NodeType,
    OperandDataType,
    OperatorType,
    OutputDestinationType,
    ParamType,
    QuestionResponseType,
    SchemaType
} from "./engine.enums";

////////////////////////////////////////////////////////////////

export interface Location {
    Name     ?: string;
    Lattitude?: number;
    Longitude?: number;
}

export type DistanceUnit = 'km' | 'mi' | 'm';
export type TimestampUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'mo' | 'y';

export interface AlmanacObject {
    Name: string;
    Data: any[] | any;
}

export interface Almanac {
    Facts: AlmanacObject[];
}

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

export class XAction {

    Type       : ActionType;
    Name       : string;
    Description: string;
    RawInput   : any | undefined;
    RawOutput  : any | undefined;
    Input      : ActionInputParams | undefined | null;
    Output     : ActionOutputParams | undefined | null;

    public constructor(
        type       : ActionType,
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined,
        rawOutput  : any | undefined) {
        this.Type = type;
        this.Name = name;
        this.Description = description;
        this.RawInput = rawInput;
        this.RawOutput = rawOutput;
        this.Input = input;
        this.Output = output;
    }

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

export class XSendMessageAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.SendMessage, name, description, input, output, rawInput, rawOutput);
    }

}

export class XSendEmailAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.SendEmail, name, description, input, output, rawInput, rawOutput);
    }

}

export class XSendSmsAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.SendSms, name, description, input, output, rawInput, rawOutput);
    }

}

export class XRestApiCallAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.RestApiCall, name, description, input, output, rawInput, rawOutput);
    }

}

export class XPythonFunCallAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.PythonFunCall, name, description, input, output, rawInput, rawOutput);
    }

}

export class XLambdaFunCallAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.LambdaFunCall, name, description, input, output, rawInput, rawOutput);
    }

}

export class XStoreDataSqlDbAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.StoreDataSqlDb, name, description, input, output, rawInput, rawOutput);
    }

}

export class XExitAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.Exit, name, description, input, output, rawInput, rawOutput);
    }

}

export class XContinueAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : ActionInputParams | undefined | null,
        output     : ActionOutputParams | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.Continue, name, description, input, output, rawInput, rawOutput);
    }

}

export interface Params {
    Name                : string;
    Type                : ParamType;
    Description        ?: string;
    Value               : any | null | undefined;
    Source             ?: InputSourceType;
    Key                ?: string;
    Required           ?: boolean;
    ComparisonThreshold?: number;
    ComparisonUnit     ?: string;
}

export interface ActionParams extends Params {
    ActionType  : string;
}

export interface ActionInputParams {
    Params: ActionParams[];
}

export interface ActionOutputParams {
    Params: ActionParams[];
}

export interface ContextParams {
    Name  : string;
    Params: Params[];
}

export interface DataExtractionInputParams extends ActionInputParams {
    Filters ?: {
        Key  : string;
        Value: string;
    }[];
    RecordDateFrom?: Date;
    RecordDateTo  ?: Date;
}

export interface DataStorageInputParams extends ActionInputParams {
    StorageKeys ?: {
        Key  : string;
        Value: string;
    }[];
}

export interface ActionOutputParams {
    DestinationType : OutputDestinationType;
    Message         : string;
    OutputTag       : string;
    NextNodeId     ?: uuid | undefined;
    Extra?          : any | undefined;
}

export interface ProcessorResult {
    Success: boolean;
    Tag    : string;
    Data   : any[] | any;
}

export type InputParams = DataExtractionInputParams |
                          DataStorageInputParams |
                          ActionInputParams;

export type OutputParams = ActionOutputParams;

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
