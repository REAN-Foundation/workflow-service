import { uuid } from "../miscellaneous/system.types";

export enum NodeType {
    QuestionNode      = 'QuestionNode',
    MessageNode       = 'MessageNode',
    ExecutionNode     = 'ExecutionNode',
    DelayedActionNode = 'DelayedActionNode',
    WaitNode          = 'WaitNode',
}

//#region Operators and Condition

export enum QuestionResponseType {
    Text                  = 'Text',
    Float                 = 'Float',
    Integer               = 'Integer',
    Boolean               = 'Boolean',
    Object                = 'Object',
    TextArray             = 'Text Array',
    FloatArray            = 'Float Array',
    IntegerArray          = 'Integer Array',
    BooleanArray          = 'Boolean Array',
    ObjectArray           = 'Object Array',
    Biometrics            = 'Biometrics',
    SingleChoiceSelection = 'Single Choice Selection',
    MultiChoiceSelection  = 'Multi Choice Selection',
    File                  = 'File',
    Date                  = 'Date',
    DateTime              = 'DateTime',
    Rating                = 'Rating',
    Location              = 'Location',
    Range                 = 'Range',
    Ok                    = 'Ok', //Acknowledgement
    None                  = 'None', //Not expecting response
}

export const QuestionResponseTypeList: QuestionResponseType[] = [
    QuestionResponseType.Text,
    QuestionResponseType.Float,
    QuestionResponseType.Integer,
    QuestionResponseType.Boolean,
    QuestionResponseType.Object,
    QuestionResponseType.TextArray,
    QuestionResponseType.FloatArray,
    QuestionResponseType.IntegerArray,
    QuestionResponseType.BooleanArray,
    QuestionResponseType.ObjectArray,
    QuestionResponseType.Biometrics,
    QuestionResponseType.SingleChoiceSelection,
    QuestionResponseType.MultiChoiceSelection,
    QuestionResponseType.File,
    QuestionResponseType.Date,
    QuestionResponseType.DateTime,
    QuestionResponseType.Rating,
    QuestionResponseType.Location,
    QuestionResponseType.Range,
    QuestionResponseType.Ok,
    QuestionResponseType.None,
];

export enum OperatorType {
    Logical      = 'Logical',
    Mathematical = 'Mathematical',
    Composition  = 'Composition',
    Iterate      = 'Iterate'
}

export const OperatorList: OperatorType[] = [
    OperatorType.Logical,
    OperatorType.Mathematical,
    OperatorType.Composition,
    OperatorType.Iterate,
];

export enum CompositionOperator {
    And  = 'And',
    Or   = 'Or',
    Xor  = 'Xor',
    None = 'None'
}

export const CompositionOperatorList: CompositionOperator[] = [
    CompositionOperator.And,
    CompositionOperator.Or,
    CompositionOperator.None,
];

export enum LogicalOperator {
    Equal                     = 'Equal',
    NotEqual                  = 'NotEqual',
    GreaterThan               = 'GreaterThan',
    GreaterThanOrEqual        = 'GreaterThanOrEqual',
    LessThan                  = 'LessThan',
    LessThanOrEqual           = 'LessThanOrEqual',
    In                        = 'In',
    NotIn                     = 'NotIn',
    Contains                  = 'Contains',
    DoesNotContain            = 'DoesNotContain',
    Between                   = 'Between',
    IsTrue                    = 'IsTrue',
    IsFalse                   = 'IsFalse',
    Exists                    = 'Exists',
    HasConsecutiveOccurrences = 'HasConsecutiveOccurrences', //array, checkFor, numTimes
    RangesOverlap             = 'RangesOverlap',
    None                      = 'None',
}

export const LogicalOperatorList: LogicalOperator[] = [
    LogicalOperator.Equal,
    LogicalOperator.NotEqual,
    LogicalOperator.GreaterThan,
    LogicalOperator.GreaterThanOrEqual,
    LogicalOperator.LessThan,
    LogicalOperator.LessThanOrEqual,
    LogicalOperator.In,
    LogicalOperator.NotIn,
    LogicalOperator.Contains,
    LogicalOperator.DoesNotContain,
    LogicalOperator.Between,
    LogicalOperator.IsTrue,
    LogicalOperator.IsFalse,
    LogicalOperator.Exists,
    LogicalOperator.HasConsecutiveOccurrences,
    LogicalOperator.RangesOverlap,
    LogicalOperator.None,
];

export enum MathematicalOperator {
    Add        = 'Add',
    Subtract   = 'Subtract',
    Divide     = 'Divide',
    Multiply   = 'Multiply',
    Percentage = 'Percentage',
    None       = 'None',
}

export const MathematicalOperatorList: MathematicalOperator[] = [
    MathematicalOperator.Add,
    MathematicalOperator.Subtract,
    MathematicalOperator.Divide,
    MathematicalOperator.Multiply,
    MathematicalOperator.Percentage,
    MathematicalOperator.None,
];

export enum OperandDataType {
    Float   = 'Float',
    Integer = 'Integer',
    Boolean = 'Boolean',
    Text    = 'Text',
    Array   = 'Array',
    Object  = 'Object',
    Date    = 'Date',
}

export const ConditionOperandDataTypeList: OperandDataType[] = [
    OperandDataType.Float,
    OperandDataType.Integer,
    OperandDataType.Boolean,
    OperandDataType.Text,
    OperandDataType.Array,
    OperandDataType.Object,
    OperandDataType.Date,
];

export enum ActionType {
    SendMessage    = 'SendMessage',
    SendEmail      = 'SendEmail',
    SendSms        = 'SendSms',
    RestApiCall    = 'RestApiCall',
    PythonFunCall  = 'PythonFunCall',
    LambdaFunCall  = 'LambdaFunCall',
    StoreDataSqlDb = 'StoreDataSqlDb',
}

//#endregion

////////////////////////////////////////////////////////////////

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

        if (Helper.isStr(this.Value) && this.DataType !== OperandDataType.Text) {
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

export interface XAction {
    Type       : ActionType;
    Name       : string;
    Description: string;
    RawInput   : any | undefined;
    RawOutput  : any | undefined;
    Input      : Map<string, any> | undefined | null;
    Output     : Map<string, any> | undefined | null;
}

export interface XPathCondition {
    id            : uuid;
    Name          : string;
    Code          : string;
    PathId        : uuid;
    ParentNodeId  : uuid;
    ParentNodeCode: string;

    IsCompositeCondition?: boolean;
    CompositionType ?    : CompositionOperator;
    ParentConditionId?   : uuid;
    OperatorType ?       : OperatorType;

    FirstOperand?: ConditionOperand;
    SecondOperand?: ConditionOperand;
    ThirdOperand?: ConditionOperand;

    Children?: CAssessmentPathCondition[];
}

export interface XQuestionOption {
    id?               : uuid;
    Code              : string;
    ProviderGivenCode?: string;
    NodeId?           : uuid;
    Text              : string;
    ImageUrl?         : string;
    Sequence          : number;
    MetaData          : Map<string, any>;
}

export interface XNodePath {
    id            : uuid;
    Name          : string;
    Code          : string;
    ParentNodeId  : NodeType;
    ParentNodeCode: string;
    NextNodeId    : uuid;
    NextNodeCode  : string;
    Condition     : string;
    Actions       : XAction[];
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

    id         : uuid;

    Name       : string;

    Description: string;

    ValidFrom  : Date;

    ValidTill  : Date;

    IsValid    : boolean;

    RootNode  ?: {
       id         : uuid,
       Name       : string;
       Description: string;
       Type       : NodeType;
        Actions ?  : {
            ActionType  : EventActionType;
            Name        : string;
            Description : string;
            InputParams : InputParams;
            OutputParams: OutputParams;
        }
    };

    Tenant     : {
        id  : uuid;
        Name: string;
        Code: string;
    };

    IdentificationParams?: Map<string, any>;

    CreatedAt: Date;

    UpdatedAt: Date;

}

// export enum EventActionType {
//     ExecuteNext        = "Execute-Next",
//     WaitForInputEvents = "Wait-For-Input-Events",
//     Exit               = "Exit",
//     AwardBadge         = "Award-Badge",
//     AwardPoints        = "Award-Points",
//     ProcessData        = "Process-Data",
//     ExtractData        = "Extract-Data",
//     CompareData        = "Compare-Data",
//     StoreData          = "Store-Data",
//     Custom             = "Custom",
// }

// export const EventActionTypeList: EventActionType[] = [
//     EventActionType.ExecuteNext,
//     EventActionType.WaitForInputEvents,
//     EventActionType.Exit,
//     EventActionType.AwardBadge,
//     EventActionType.AwardPoints,
//     EventActionType.ProcessData,
//     EventActionType.ExtractData,
//     EventActionType.CompareData,
//     EventActionType.StoreData,
//     EventActionType.Custom,
// ];

// export enum DataActionType {
//     CalculateContinuity = "Calculate-Continuity",
//     FindRangeDifference = "Find-Range-Difference",
//     MaximumInRange      = "Maximum-In-Range",
//     MinimumInRange      = "Minimum-In-Range",
//     CalculatePercentile = "Calculate-Percentile",
// }

// export const DataActionTypeList: DataActionType[] = [
//     DataActionType.CalculateContinuity,
//     DataActionType.FindRangeDifference,
//     DataActionType.MaximumInRange,
//     DataActionType.MinimumInRange,
//     DataActionType.CalculatePercentile,
// ];

export enum ExecutionStatus {
    Pending  = "Pending",
    Executed = "Executed",
    Waiting  = "Waiting",
    Exited   = "Exited",
}

export const ExecutionStatusList: ExecutionStatus[] = [
    ExecutionStatus.Pending,
    ExecutionStatus.Executed,
    ExecutionStatus.Waiting,
    ExecutionStatus.Exited,
];

export enum InputSourceType {
    Database    = "Database",
    Almanac     = "Almanac",
    ApiEndpoint = "ApiEndpoint",
}

export const InputSourceTypeList: InputSourceType[] = [
    InputSourceType.Database,
    InputSourceType.Almanac,
    InputSourceType.ApiEndpoint,
];

export interface ActionInputParams {
    RecordType        : string;
    SourceType        : InputSourceType;
    InputTag         ?: string;
    SecondaryInputTag?: string;
}

export interface DataExtractionInputParams extends ActionInputParams {
    Filters ?: {
        Key  : string;
        Value: string;
    }[];
    RecordDateFrom?: Date;
    RecordDateTo  ?: Date;
}

export interface ContinuityInputParams extends ActionInputParams {
    DataActionType ?: DataActionType;
    KeyDataType    ?: OperandDataType;
    KeyName        ?: string;
    ValueDataType  ?: OperandDataType;
    ValueName      ?: string;
    Value          ?: any;
    SecondaryValue ?: any;
    Operator        : LogicalOperator;
    ContinuityCount : number;
}

export interface ValueComparisonInputParams extends ActionInputParams {
    DataActionType ?: DataActionType;
    Filters ?: {
        Key  : string;
        Value: string;
    }[];
}

export interface RangeComparisonInputParams extends ActionInputParams {
    DataActionType ?: DataActionType;
    Filters ?: {
        Key  : string;
        Value: string;
    }[];
}

export interface DataStorageInputParams extends ActionInputParams {
    StorageKeys ?: {
        Key  : string;
        Value: string;
    }[];
}

export enum OutputDestinationType {
    Database    = "Database",
    Almanac     = "Almanac",
    ApiEndpoint = "ApiEndpoint",
}

export const OutputSourceTypeList: OutputDestinationType[] = [
    OutputDestinationType.Database,
    OutputDestinationType.Almanac,
    OutputDestinationType.ApiEndpoint,
];

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
                          ContinuityInputParams |
                          ValueComparisonInputParams |
                          RangeComparisonInputParams |
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
