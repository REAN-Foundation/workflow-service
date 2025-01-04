export enum EventType {
    UserMessage          = 'UserMessage',
    TerminateWorkflow    = 'TerminateWorkflow',
    TriggerChildWorkflow = 'TriggerChildWorkflow',
}

export const EventTypeList: EventType[] = [
    EventType.UserMessage,
    EventType.TerminateWorkflow,
    EventType.TriggerChildWorkflow
];
