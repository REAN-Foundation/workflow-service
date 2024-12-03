import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { UserMessageType } from "../engine.enums";
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
