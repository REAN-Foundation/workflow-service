import { Event } from "../../models/engine/event.model";
import { EventResponseDto } from "../../../domain.types/engine/event.types";

///////////////////////////////////////////////////////////////////////////////////

export class EventMapper {

    static toResponseDto = (event: Event): EventResponseDto => {
        if (event == null) {
            return null;
        }
        const dto: EventResponseDto = {
            id               : event.id,
            EventType        : event.EventType,
            SchemaId         : event.SchemaId,
            SchemaInstanceId : event.SchemaInstanceId,
            UserMessage      : event.UserMessage,
            EventTimestamp   : event.EventTimestamp,
            TenantId         : event.TenantId,
            Handled          : event.Handled,
            HandledTimestamp : event.HandledTimestamp,
            Payload          : event.Payload,
            CreatedAt        : event.CreatedAt,
            UpdatedAt        : event.UpdatedAt,
        };
        return dto;
    };

}
