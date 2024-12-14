import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { MessageChannelType, UserMessageType } from "../engine.enums";
import { XQuestionOption } from "./node.types";
import { Location } from "../intermediate.types/common.types";

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

export interface MessagePayload {
    MessageType              : UserMessageType;
    ProcessingEventId        : uuid;
    ChannelMessageId         : string;
    ChannelType              : MessageChannelType;
    PreviousChannelMessageId?: string;
    BotMessageId             : uuid;
    PreviousBotMessageId    ?: uuid;
    SchemaId                ?: uuid;
    SchemaInstanceId        ?: uuid;
    SchemaInstanceCode      ?: string;
    SchemaName              ?: string;
    NodeInstanceId          ?: uuid;
    NodeId                  ?: uuid;
    ActionId                ?: uuid;
}

export interface WorkflowMessageEvent {
    Phone?           : string;
    EventTimestamp   : Date;
    MessageType      : UserMessageType;
    MessageChannel   : MessageChannelType;
    TextMessage     ?: string;
    ImageUrl        ?: string;
    AudioUrl        ?: string;
    VideoUrl        ?: string;
    Location        ?: Location;
    QuestionResponse?: QuestionResponseMessage;
    Payload         ?: MessagePayload;
}
