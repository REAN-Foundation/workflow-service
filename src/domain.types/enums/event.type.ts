export enum EventType {
    UserMessage            = 'UserMessage',
    WorkflowSystemMessage  = 'WorkflowSystemMessage',
    TerminateWorkflowEvent = 'TerminateWorkflowEvent',
    WorkflowSystemEvent    = 'WorkflowSystemEvent',
    TriggerChildWorkflow   = 'TriggerChildWorkflow',
}

export const EventTypeList: EventType[] = [
    EventType.UserMessage,
    EventType.WorkflowSystemMessage,
    EventType.WorkflowSystemEvent,
    EventType.TerminateWorkflowEvent,
    EventType.TriggerChildWorkflow
];
