// import { Event } from "../../models/engine/event.model";
// import { EventResponseDto } from "../../../domain.types/engine/event.types";

// ///////////////////////////////////////////////////////////////////////////////////

// export class EventMapper {

//     static toResponseDto = (event: Event): EventResponseDto => {
//         if (event == null) {
//             return null;
//         }
//         const dto: EventResponseDto = {
//             id          : event.id,
//             ReferenceId : event.ReferenceId,
//             EventType   : event.EventType,
//             Context     : {
//                 id          : event.Context.id,
//                 ReferenceId : event.Context.ReferenceId,
//                 Type        : event.Context.Type,
//                 Participant : event.Context.Participant ? {
//                     id          : event.Context.Participant.id,
//                     ReferenceId : event.Context.Participant.ReferenceId,
//                     Prefix      : event.Context.Participant.Prefix,
//                     FirstName   : event.Context.Participant.FirstName,
//                     LastName    : event.Context.Participant.LastName,
//                 } : null,
//                 ParticipantGroup : event.Context.Group ? {
//                     id          : event.Context.Group.id,
//                     Name        : event.Context.Group.Name,
//                     Description : event.Context.Group.Description,
//                 } : null,
//             },
//             Payload   : event.Payload,
//             CreatedAt : event.CreatedAt,
//             UpdatedAt : event.UpdatedAt,
//         };
//         return dto;
//     };

// }
