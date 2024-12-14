export enum SchemaType {
    ChatBot = 'ChatBot',
    Application = 'Application',
}

export enum WorkflowActivityType {
    UserEvent         = 'UserEvent',
    NodeAction        = 'NodeAction',
    SystemEvent       = 'SystemEvent',
    SwitchCurrentNode = 'SwitchCurrentNode',
}

export enum ParamType {
    Phonenumber      = "Phonenumber",
    Email            = "Email",
    Location         = "Location",
    RestApiParams    = "RestApiParams",
    Date             = "Date",
    DateTime         = "DateTime",
    Float            = 'Float',
    Integer          = 'Integer',
    Boolean          = 'Boolean',
    Text             = 'Text',
    Array            = 'Array',
    Object           = 'Object',
    Placeholder      = 'Placeholder',
    NodeId           = 'NodeId',
    SchemaId         = 'SchemaId',
    SchemaInstanceId = 'SchemaInstanceId',
    NodeInstanceId   = 'NodeInstanceId',
    ChannelMessageId = 'ChannelMessageId',
    Unknown          = 'Unknown',
}

export const SchemaTypeList: SchemaType[] = [
    SchemaType.ChatBot,
    SchemaType.Application,
];

export enum UserMessageType {
    Text     = 'Text',
    Audio    = 'Audio',
    Video    = 'Video',
    Link     = 'Link',
    Location = 'Location',
    File     = 'File'
}

export const MessageTypeList: UserMessageType[] = [
    UserMessageType.Text,
    UserMessageType.Audio,
    UserMessageType.Video,
    UserMessageType.Link,
    UserMessageType.Location,
    UserMessageType.File,
];

export enum MessageChannelType {
    WhatsApp = 'WhatsApp',
    Telegram = 'Telegram',
    Sms      = 'Sms',
    Other    = 'Other',
}

export const MessageChannelList: MessageChannelType[] = [
    MessageChannelType.WhatsApp,
    MessageChannelType.Telegram,
    MessageChannelType.Sms,
    MessageChannelType.Other,
];

export enum NodeType {
    ExecutionNode = 'ExecutionNode',
    QuestionNode  = 'QuestionNode',
    ListeningNode = 'ListeningNode',
    YesNoNode     = 'YesNoNode',
    WaitNode      = 'WaitNode',
}

export const NodeTypeList: NodeType[] = [
    NodeType.ExecutionNode,
    NodeType.QuestionNode,
    NodeType.ListeningNode,
    NodeType.YesNoNode,
    NodeType.WaitNode,
];

export enum ActionType {
    TriggerListeningNode   = 'TriggerListeningNode',
    TriggerWaitNode        = 'TriggerWaitNode',
    TriggerAnotherWorkflow = 'TriggerAnotherWorkflow',
    SendMessage            = 'SendMessage',
    SendMultipleMessages   = 'SendMultipleMessages',
    SendEmail              = 'SendEmail',
    SendSms                = 'SendSms',
    RestApiCall            = 'RestApiCall',
    PythonFunCall          = 'PythonFunCall',
    LambdaFunCall          = 'LambdaFunCall',
    StoreToSqlDb           = 'StoreToSqlDb',
    GetFromSqlDb           = 'GetFromSqlDb',
    StoreToAlmanac         = 'StoreToAlmanac',
    ExistsInAlmanac        = 'ExistsInAlmanac',
    GetFromAlmanac         = 'GetFromAlmanac',
    UpdateContextParams    = 'UpdateContextParams',
    Exit                   = 'Exit',
    Continue               = 'Continue',
}

export const ActionTypeList: ActionType[] = [
    ActionType.TriggerListeningNode,
    ActionType.TriggerWaitNode,
    ActionType.TriggerAnotherWorkflow,
    ActionType.SendMessage,
    ActionType.SendEmail,
    ActionType.SendSms,
    ActionType.RestApiCall,
    ActionType.PythonFunCall,
    ActionType.LambdaFunCall,
    ActionType.StoreToSqlDb,
    ActionType.StoreToAlmanac,
    ActionType.GetFromAlmanac,
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

export enum CompositionOperatorType {
    And  = 'And',
    Or   = 'Or',
    Xor  = 'Xor',
    None = 'None'
}

export const CompositionOperatorList: CompositionOperatorType[] = [
    CompositionOperatorType.And,
    CompositionOperatorType.Or,
    CompositionOperatorType.None,
];

export enum LogicalOperatorType {
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

export const LogicalOperatorList: LogicalOperatorType[] = [
    LogicalOperatorType.Equal,
    LogicalOperatorType.NotEqual,
    LogicalOperatorType.GreaterThan,
    LogicalOperatorType.GreaterThanOrEqual,
    LogicalOperatorType.LessThan,
    LogicalOperatorType.LessThanOrEqual,
    LogicalOperatorType.In,
    LogicalOperatorType.NotIn,
    LogicalOperatorType.Contains,
    LogicalOperatorType.DoesNotContain,
    LogicalOperatorType.Between,
    LogicalOperatorType.IsTrue,
    LogicalOperatorType.IsFalse,
    LogicalOperatorType.Exists,
    LogicalOperatorType.HasConsecutiveOccurrences,
    LogicalOperatorType.RangesOverlap,
    LogicalOperatorType.None,
];

export enum MathematicalOperatorType {
    Add        = 'Add',
    Subtract   = 'Subtract',
    Divide     = 'Divide',
    Multiply   = 'Multiply',
    Percentage = 'Percentage',
    None       = 'None',
}

export const MathematicalOperatorList: MathematicalOperatorType[] = [
    MathematicalOperatorType.Add,
    MathematicalOperatorType.Subtract,
    MathematicalOperatorType.Divide,
    MathematicalOperatorType.Multiply,
    MathematicalOperatorType.Percentage,
    MathematicalOperatorType.None,
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
    UserEvent    = "UserEvent",
    SystemEvent  = "SystemEvent",
    SystemData   = "SystemData",
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
    InputSourceType.UserEvent,
    InputSourceType.SystemEvent,
    InputSourceType.Database,
    InputSourceType.Almanac,
    InputSourceType.ApiEndpoint,
    InputSourceType.CsvDocument,
    InputSourceType.ExcelSheet,
    InputSourceType.JSON,
    InputSourceType.JSONFile,
    InputSourceType.CustomObject,
];

export enum OutputDestinationType {
    Database    = "Database",
    Almanac     = "Almanac",
    ApiEndpoint = "ApiEndpoint",
    None        = "None",
}

export const OutputSourceTypeList: OutputDestinationType[] = [
    OutputDestinationType.Database,
    OutputDestinationType.Almanac,
    OutputDestinationType.ApiEndpoint,
];
