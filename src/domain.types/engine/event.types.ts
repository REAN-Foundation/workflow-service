import { EventType } from "../enums/event.type";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import { uuid } from "../miscellaneous/system.types";
import { WorkflowMessageEvent } from "./intermediate.types/user.event.types";

////////////////////////////////////////////////////////////

export interface EventCreateModel {
    EventType        : EventType;
    TenantId         : uuid;
    SchemaId         : uuid;
    SchemaInstanceId?: uuid;
    UserMessage     ?: WorkflowMessageEvent;
    Payload         ?: any;
    EventTimestamp   : Date;
}

export interface EventUpdateModel {
    SchemaInstanceId?: uuid;
}

export interface EventResponseDto {
    id                 : uuid;
    EventType          : EventType;
    TenantId           : uuid;
    SchemaId          ?: uuid;
    SchemaInstanceId  ?: uuid;
    SchemaName        ?: string;
    SchemaInstanceCode?: string;
    UserMessage       ?: WorkflowMessageEvent;
    Payload           ?: any;
    EventTimestamp     : Date;
    Handled           ?: boolean;
    HandledTimestamp  ?: Date;
    CreatedAt          : Date;
    UpdatedAt          : Date;
}

export interface EventSearchFilters extends BaseSearchFilters {
    TenantId         : uuid;
    EventType        : EventType;
    SchemaId        ?: uuid;
    SchemaInstanceId?: uuid;
}

export interface EventSearchResults extends BaseSearchResults {
    Items: EventResponseDto[];
}

////////////////////////////////////////////////////////////

export interface MessageEventCreateModel extends EventCreateModel {
    Payload : {
        QuestionOptions     ?: string[];
        ChosenOption        ?: string;
        ChosenOptionSequence?: number;
        TextMessage          : string;
        Location             : {
            Latitude : number;
            Longitude: number;
        };
        Images            : string[];
        Videos            : string[];
        Audios            : string[];
        PreviousMessageId?: uuid;
        PreviousMessage  ?: string;
        PreviousNodeId   ?: uuid;
    };
}

export interface MessageEventResponseDto extends EventResponseDto {
    Payload          : {
        QuestionOptions     ?: string[];
        ChosenOption        ?: string;
        ChosenOptionSequence?: number;
        TextMessage          : string;
        Location             : {
            Latitude : number;
            Longitude: number;
        };
        Images            : string[];
        Videos            : string[];
        Audios            : string[];
        PreviousMessageId?: uuid;
        PreviousMessage  ?: string;
        PreviousNodeId   ?: uuid;
    };
}

////////////////////////////////////////////////////////////
