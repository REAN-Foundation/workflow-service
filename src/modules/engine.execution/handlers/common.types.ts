import { NodeResponseDto } from "../../../domain.types/engine/node.types";
import { NodeInstanceResponseDto } from "../../../domain.types/engine/node.instance.types";
import { EventResponseDto } from "../../../domain.types/engine/event.types";

////////////////////////////////////////////////////////////////

export const ASYNC_TASK_COUNT = 4;

export interface TimerNodeTriggerModel {
    NodeInstance: NodeInstanceResponseDto;
    Node: NodeResponseDto;
    Event: EventResponseDto;
}

////////////////////////////////////////////////////////////////
