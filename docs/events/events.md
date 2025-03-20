# Events

Events are the triggers by which the workflow engine communicates with the outside world or handle internal happenings. Events can be triggered by external systems, such as a user interface, a sensor, or a timer. Events can also be triggered by the workflow engine itself, such as when a node completes execution.

## Types of Events

Currently, the following types of events are supported:

### User and System Events
- **UserMessage**: Represents a message sent by a user within the workflow system.
- **SystemMessage**: Represents an internal system-generated message within the workflow.

### Workflow Lifecycle Events
- **TerminateWorkflow**: Triggers the termination of an ongoing workflow.

### Workflow Execution Events
- **TriggerChildWorkflow**: Represents an event that triggers the execution of a child workflow.


