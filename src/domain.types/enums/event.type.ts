export enum EventType {
    UserMessage = 'UserMessage',
    TerminateWorkflow = 'TerminateWorkflow',
}

export const EventTypeList: EventType[] = [
    EventType.UserMessage,
    EventType.TerminateWorkflow,
];
