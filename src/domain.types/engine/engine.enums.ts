export enum SchemaType {
    ChatBot = 'ChatBot',
    Application = 'Application',
}

export enum WorkflowActivityType {
    UserEvent         = 'UserEvent',
    NodeAction        = 'NodeAction',
    SystemEvent       = 'SystemEvent',
    SwitchCurrentNode = 'SwitchCurrentNode',
    TerminateWorkflow = 'TerminateWorkflow',
}

export enum ParamType {
    Phone            = "Phone",
    Email            = "Email",
    Location         = "Location",
    MessageChannel   = "MessageChannel",
    RestApiParams    = "RestApiParams",
    Date             = "Date",
    DateTime         = "DateTime",
    Timestamp        = "Timestamp",
    Float            = 'Float',
    Integer          = 'Integer',
    Boolean          = 'Boolean',
    Text             = 'Text',
    RandomCode       = 'RandomCode',
    Array            = 'Array',
    Object           = 'Object',
    ObjectKey        = 'ObjectKey',
    ObjectParam      = 'ObjectParam',
    Placeholder      = 'Placeholder',
    NodeId           = 'NodeId',
    SchemaId         = 'SchemaId',
    SchemaInstanceId = 'SchemaInstanceId',
    NodeInstanceId   = 'NodeInstanceId',
    QuestionId       = 'QuestionId',
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
    File     = 'File',
    Question = 'Question',
    QuestionResponse = 'QuestionResponse',
    Image    = 'Image',
}

export const MessageTypeList: UserMessageType[] = [
    UserMessageType.Text,
    UserMessageType.Audio,
    UserMessageType.Video,
    UserMessageType.Link,
    UserMessageType.Location,
    UserMessageType.File,
    UserMessageType.Question,
    UserMessageType.QuestionResponse,
    UserMessageType.Image,
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
    ExecutionNode        = 'ExecutionNode',
    QuestionNode         = 'QuestionNode',
    ListeningNode        = 'ListeningNode',
    YesNoNode            = 'YesNoNode',
    TimerNode            = 'TimerNode',
    LogicalTimerNode     = 'LogicalTimerNode',   //Timer node executes some rule-logic once it times out
    TerminatorNode       = 'TerminatorNode',
}

export const NodeTypeList: NodeType[] = [
    NodeType.ExecutionNode,
    NodeType.QuestionNode,
    NodeType.ListeningNode,
    NodeType.YesNoNode,
    NodeType.TimerNode,
    NodeType.LogicalTimerNode,
    NodeType.TerminatorNode,
];

export enum ActionType {
    TriggerListeningNode            = 'TriggerListeningNode',
    TriggerTimerNode                = 'TriggerTimerNode',
    TriggerLogicalTimerNode         = 'TriggerLogicalTimerNode',
    TriggerChildWorkflow            = 'TriggerChildWorkflow',
    TriggerMultipleChildrenWorkflow = 'TriggerMultipleChildrenWorkflow',
    SendMessage                     = 'SendMessage',
    SendMultipleMessagesToOneUser   = 'SendMultipleMessagesToOneUser',
    SendOneMessageToMultipleUsers   = 'SendOneMessageToMultipleUsers',
    SendEmail                       = 'SendEmail',
    SendSms                         = 'SendSms',
    SetNextNode                     = 'SetNextNode',
    RestApiCall                     = 'RestApiCall',
    PythonFunCall                   = 'PythonFunCall',
    LambdaFunCall                   = 'LambdaFunCall',
    StoreToSqlDb                    = 'StoreToSqlDb',
    GetFromSqlDb                    = 'GetFromSqlDb',
    StoreToAlmanac                  = 'StoreToAlmanac',
    ExistsInAlmanac                 = 'ExistsInAlmanac',
    GetFromAlmanac                  = 'GetFromAlmanac',
    UpdateContextParams             = 'UpdateContextParams',
    GenerateRandomCode              = 'GenerateRandomCode',
    ArraySort                       = 'ArraySort',
    ArrayFilter                     = 'ArrayFilter',
    ArrayGetElement                 = 'ArrayGetElement',
    GetObjectParam                  = 'GetObjectParam',
    ConstructTextArrayFromTemplate  = 'ConstructTextArrayFromTemplate',
    ConstructTextFromTemplate       = 'ConstructTextFromTemplate',
    ConstructObject                 = 'ConstructObject',
    Exit                            = 'Exit',
    Continue                        = 'Continue',
}

export const ActionTypeList: ActionType[] = [
    ActionType.TriggerListeningNode,
    ActionType.TriggerTimerNode,
    ActionType.TriggerLogicalTimerNode,
    ActionType.TriggerChildWorkflow,
    ActionType.TriggerMultipleChildrenWorkflow,
    ActionType.SendMessage,
    ActionType.SendMultipleMessagesToOneUser,
    ActionType.SendOneMessageToMultipleUsers,
    ActionType.SendEmail,
    ActionType.SendSms,
    ActionType.SetNextNode,
    ActionType.RestApiCall,
    ActionType.PythonFunCall,
    ActionType.LambdaFunCall,
    ActionType.StoreToSqlDb,
    ActionType.GetFromSqlDb,
    ActionType.StoreToAlmanac,
    ActionType.ExistsInAlmanac,
    ActionType.GetFromAlmanac,
    ActionType.UpdateContextParams,
    ActionType.GenerateRandomCode,
    ActionType.ArraySort,
    ActionType.ArrayFilter,
    ActionType.ArrayGetElement,
    ActionType.GetObjectParam,
    ActionType.ConstructTextArrayFromTemplate,
    ActionType.ConstructTextFromTemplate,
    ActionType.ConstructObject,
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
    IsEmpty                   = 'IsEmpty',
    IsNotEmpty                = 'IsNotEmpty',
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
    LogicalOperatorType.IsEmpty,
    LogicalOperatorType.IsNotEmpty,
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
    Float        = 'Float',
    Integer      = 'Integer',
    Boolean      = 'Boolean',
    Text         = 'Text',
    Array        = 'Array',
    Object       = 'Object',
    Date         = 'Date',
    TextArray    = 'TextArray',
    IntegerArray = 'IntegerArray',
    FloatArray   = 'FloatArray',
    BooleanArray = 'BooleanArray',
}

export const ConditionOperandDataTypeList: OperandDataType[] = [
    OperandDataType.Float,
    OperandDataType.Integer,
    OperandDataType.Boolean,
    OperandDataType.Text,
    OperandDataType.Array,
    OperandDataType.Object,
    OperandDataType.Date,
    OperandDataType.TextArray,
    OperandDataType.IntegerArray,
    OperandDataType.FloatArray,
    OperandDataType.BooleanArray,
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
    InputSourceType.SystemData,
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
    Database                    = "Database",
    Almanac                     = "Almanac",
    ParentSchemaInstanceAlmanac = "ParentSchemaInstanceAlmanac",
    ApiEndpoint                 = "ApiEndpoint",
    None                        = "None",
}

export const OutputSourceTypeList: OutputDestinationType[] = [
    OutputDestinationType.Database,
    OutputDestinationType.Almanac,
    OutputDestinationType.ApiEndpoint,
    OutputDestinationType.None,
];
