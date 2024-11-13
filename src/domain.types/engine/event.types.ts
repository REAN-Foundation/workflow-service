import { EventType } from "../enums/event.type";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import { uuid } from "../miscellaneous/system.types";

////////////////////////////////////////////////////////////

export enum NodeType {
    QuestionNode      = 'QuestionNode',
    MessageNode       = 'MessageNode',
    DelayedActionNode = 'DelayedActionNode',
    WaitNode          = 'WaitNode',
}

export interface EventCreateModel {
    TenantId         : uuid;
    EventType        : EventType;
    ReferenceId     ?: uuid;
    SchemaInstanceId?: uuid;
    SchemaName      ?: string;
    SchemaId        ?: uuid;
    TimeStamp        : Date;
}

export interface EventUpdateModel {
    SchemaInstanceId?: uuid;
    ReferenceId     ?: uuid;
    Handled         ?: boolean;
    SchemaName      ?: string;
    SchemaId        ?: uuid;
}

export interface EventResponseDto {
    id               : uuid;
    TenantId         : uuid;
    EventType        : EventType;
    ReferenceId     ?: uuid;
    SchemaInstanceId?: uuid;
    SchemaName      ?: string;
    SchemaId        ?: uuid;
    TimeStamp        : Date;
    Handled         ?: boolean;
    CreatedAt        : Date;
    UpdatedAt        : Date;
}

export interface EventSearchFilters extends BaseSearchFilters {
    TenantId         : uuid;
    EventType        : EventType;
    ReferenceId     ?: uuid;
    SchemaInstanceId?: uuid;
    SchemaName      ?: string;
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
