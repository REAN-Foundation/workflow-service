import { uuid } from "../miscellaneous/system.types";
import { MessageChannelType, QuestionResponseType, UserMessageType } from "./engine.enums";
import { Location } from "./common.types";
import { Params } from "./params.types";

////////////////////////////////////////////////////////////////

export interface QuestionAnswerOption {
    id?               : uuid;
    Text              : string;
    ImageUrl?         : string;
    Sequence          : number;
    Metadata          : { Key: string, Value: string }[];
}

export interface QuestionResponseMessage {
    QuestionId                      ?: uuid;
    QuestionText                    ?: string;
    QuestionOptions                 ?: QuestionAnswerOption[];
    QuestionResponseType            ?: QuestionResponseType;
    ResponseContent                 ?: string | number | boolean | any[];
    SingleChoiceChosenOption        ?: string;
    SingleChoiceChosenOptionSequence?: number;
    PreviousMessageId               ?: uuid;
    PreviousNodeId                  ?: uuid;
}

export interface MessagePayload {
    MessageType               : UserMessageType;
    ProcessingEventId         : uuid;
    ChannelType               : MessageChannelType;
    ChannelMessageId          : string;
    PreviousChannelMessageId ?: string;
    MessageTemplateId        ?: string;
    PreviousMessageTemplateId?: string;
    BotMessageId              : uuid;
    PreviousBotMessageId     ?: uuid;
    SchemaId                 ?: uuid;
    SchemaInstanceId         ?: uuid;
    SchemaInstanceCode       ?: string;
    SchemaName               ?: string;
    NodeInstanceId           ?: uuid;
    NodeId                   ?: uuid;
    ActionId                 ?: uuid;
    Metadata                 ?: Params[];
}

// Back and forth
export interface WorkflowMessage {
    Phone?               : string;
    EventTimestamp       : Date;
    MessageType          : UserMessageType;
    MessageChannel       : MessageChannelType;
    TextMessage         ?: string;
    ImageUrl            ?: string;
    AudioUrl            ?: string;
    VideoUrl            ?: string;
    Location            ?: Location;
    FileUrl             ?: string;
    QuestionText        ?: string;
    QuestionOptions     ?: QuestionAnswerOption[];
    QuestionResponseType?: QuestionResponseType;
    QuestionResponse    ?: QuestionResponseMessage;
    Placeholders        ?: { Key: string, Value: string }[];
    Payload             ?: MessagePayload;
}
////////////////////////////////////////////////////////////////
