import { EventType } from "../enums/event.type";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import { uuid } from "../miscellaneous/system.types";
import { ContextType } from "./engine.types";

////////////////////////////////////////////////////////////

export interface EventCreateModel {
    EventType   : EventType;
    ReferenceId : uuid;
    Payload     : any;
}

export interface EventUpdateModel {
    TypeId     ?: uuid;
    ReferenceId?: uuid;
}

export interface EventResponseDto {
    id: uuid;
    EventType: EventType;
    Context : {
        id          : uuid;
        ReferenceId : uuid;
        Type        : ContextType;
        Participant?: {
            id         : uuid;
            ReferenceId: uuid;
            Prefix     : string;
            FirstName  : string;
            LastName   : string;
        };
        ParticipantGroup ?: {
            id         : uuid;
            Name       : string;
            Description: string;
        };
    };
    ReferenceId: uuid;
    Payload    : any;
    CreatedAt  : Date;
    UpdatedAt  : Date;
}

export interface EventSearchFilters extends BaseSearchFilters {
    TypeId     ?: uuid;
    ReferenceId?: uuid;
}

export interface EventSearchResults extends BaseSearchResults {
    Items: EventResponseDto[];
}
