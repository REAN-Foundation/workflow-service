export enum EventType {
    UserMessage          = 'UserMessage',
    WorkflowSystemMessage= 'WorkflowSystemMessage',
    TerminateWorkflow    = 'TerminateWorkflow',
    TriggerChildWorkflow = 'TriggerChildWorkflow',
}

export const EventTypeList: EventType[] = [
    EventType.UserMessage,
    EventType.WorkflowSystemMessage,
    EventType.TerminateWorkflow,
    EventType.TriggerChildWorkflow
];
