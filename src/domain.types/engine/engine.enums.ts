
export enum SchemaType {
    ChatBot = 'ChatBot',
    Application = 'Application',
}

export const SchemaTypeList: SchemaType[] = [
    SchemaType.ChatBot,
    SchemaType.Application,
];

export enum NodeType {
    QuestionNode      = 'QuestionNode',
    // MessageNode       = 'MessageNode',
    ExecutionNode     = 'ExecutionNode',
    DelayedActionNode = 'DelayedActionNode',
    // WaitNode          = 'WaitNode',
}

export const NodeTypeList: NodeType[] = [
    NodeType.QuestionNode,
    // NodeType.MessageNode,
    NodeType.ExecutionNode,
    NodeType.DelayedActionNode,
    // NodeType.WaitNode,
];

export enum ActionType {
    SendMessage    = 'SendMessage',
    SendEmail      = 'SendEmail',
    SendSms        = 'SendSms',
    RestApiCall    = 'RestApiCall',
    PythonFunCall  = 'PythonFunCall',
    LambdaFunCall  = 'LambdaFunCall',
    StoreDataSqlDb = 'StoreDataSqlDb',
    Exit           = 'Exit',
    Continue       = 'Continue',
}

export const ActionTypeList: ActionType[] = [
    ActionType.SendMessage,
    ActionType.SendEmail,
    ActionType.SendSms,
    ActionType.RestApiCall,
    ActionType.PythonFunCall,
    ActionType.LambdaFunCall,
    ActionType.StoreDataSqlDb,
    ActionType.Exit,
    ActionType.Continue,
];

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
    Database     = "Database",
    Almanac      = "Almanac",
    ApiEndpoint  = "ApiEndpoint",
    CsvDocument  = "CsvDocument",
    ExcelSheet   = "ExcelSheet",
    JSON         = "JSON",
    JSONFile     = "JSONFile",
    CustomObject = "CustomObject",
}

export const InputSourceTypeList: InputSourceType[] = [
    InputSourceType.Database,
    InputSourceType.Almanac,
    InputSourceType.ApiEndpoint,
    InputSourceType.CsvDocument,
    InputSourceType.ExcelSheet,
    InputSourceType.JSON,
    InputSourceType.JSONFile,
    InputSourceType.CustomObject,

];
