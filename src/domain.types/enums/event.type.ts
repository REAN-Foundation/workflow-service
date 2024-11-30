export enum EventType {
    UserMessage = 'User Message',
    TerminateWorkflow = 'Terminate Workflow',
}

export const EventTypeList: EventType[] = [
    EventType.UserMessage,
    EventType.TerminateWorkflow,
];
