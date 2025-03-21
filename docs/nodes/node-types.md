# Node Types

Each node type serves a specific function in processing tasks, handling events, executing logic, or controlling the flow of execution.
These node types collectively define the structure and behavior of workflows, allowing for flexible automation, decision-making, and event handling. Each node plays a specific role in managing workflow execution, ensuring defined processing of tasks and decisions.

## Node Types

### Execution Node
**Node Features**
- Does not contain any logical conditions.
- Holds a set of tasks which are executed in order.
- If the execution delay is set, the action execution is delayed by the specified time.
- One cannot move to the next node unless all the actions are executed successfully.

**Use Cases**
- Performing API calls, computations, or database operations.
- Sending an email notification to a user.
- Logging data for analytics purposes.
- Processing data or transforming information.

**Properties**

- **Delay**: The delay before executing the action.
- **Actions**: The list of actions to execute.
- **Next Node**: The next node to transition to after executing the actions.

---

### Question Node
**Node Features**
- Poses a question to the user/interacting agent.
- This question is generally single choice out of multiple options.
- Each option represents a different node path to be taken.
- If the response is not one of the options, the question is repeated until a valid response is received.
- The workflow pauses until a valid response is provided.
- Once a valid option (response) is provided, the workflow path corresponding to the path is taken.
- Each option is associated with a different node path to transition to based on the user's choice.
- The question node is a type of decision node that routes the workflow based on user input.

**Use Cases**
- Collecting user input to make a decision.
- Routing the workflow based on user choices.
- Implementing interactive workflows with user prompts.
- Handling user interactions in a conversational manner.
- Implementing decision trees based on user responses.

**Properties**

- **Question**: The question to ask the user.
- **Options**: The list of options to present to the user.
- **Option Node Paths**: The mapping of options to the next nodes to transition to based on the user's choice.

---

### Event Listener Node
**Node Features**
- Waits for a specific event to occur before continuing execution.
- Listens for external system signals or user interactions.
- This node can be a free (floating) node or part of the workflow graph.
- If free node, it has to be triggered through some pre-defined node action, e.g. `TriggerEventListenerNode`.
- The expected type of the event and expected event content is defined in the node's `Input` field. For example, the event type could be `UserEvent` and the event content could be `Location`.
- It performs the actions once the event is received and confirmed.

**Use Cases**
- Waiting for a user to complete an action before proceeding.
- Triggering actions based on external events.
- Handling asynchronous events in a workflow.
- Implementing event-driven workflows.

**Properties**

- **Event**: The type of event to listen for.
- **Input**: The expected content of the event.
- **Actions**: The actions to execute.
- **Next Node**: (Optional if part of the workflow path) The next node to transition to after executing the actions. Not required if it is a free node.

---

### Logical Yes-No Action Node
**Node Features**
- Evaluates a condition and routes the workflow based on a yes/no (true/false) decision.
- This node waits for events and once the event is received it evaluates the condition.
- This node need not have any generic actions associated with it as it has two default actions. Yes-Action and No-Action.
- Based on the condition evaluation, the respective action is executed.

**Properties**

- **Event**: The event to listen for. This is generally of type UserEvent.
- **Rule**: The rule with a condition to evaluate.
- **Yes-Action**: The action to execute if the condition is true.
- **No-Action**: The action to execute if the condition is false.

**Detailed Steps of the Node Traversal**

1. Retrieve the current node using the node service.
2. Get the IDs for the YesAction and NoAction associated with the current node.
3. Retrieve the YesAction and NoAction using the action service.
4. Create or retrieve action instances for the YesAction and NoAction.
5. Retrieve the rule associated with the current node.
6. If the rule is not found, log an error and return `null`.
7. Create an `ActionExecutioner` instance.
8. Retrieve and process the condition associated with the rule.
9. Log the result of the condition evaluation.
10. Determine which action to execute based on the condition result.
11. If the action type is `Continue`, set the next node instance and return it.
12. Otherwise, execute the action and log the result.
13. Return the current node instance.

**Use Cases**
- Conditional branching based on user choices or system state.
- Checking if a user is eligible for a discount.
- Routing the workflow based on a user's subscription status.
- Implementing decision trees based on rule-based conditions.
- Handling yes/no decisions in a workflow.

---

### Logical Node
**Node Features**
- Similar to 'Logical Yes-No Action Node' but without the predefined Yes-Action and No-Action.
- Evaluates a condition against available facts.
- Multiple possible paths are defined and each path has a rule/conditions associated with it.
- Based on the condition evaluation, the respective path is taken.
- This node is used when there are more than two possible paths to take based on the condition evaluation.

**Use Cases**
- Implementing complex decision trees with multiple branches.
- Routing the workflow based on multiple conditions.
- Handling multiple possible outcomes based on rule-based conditions.
- Implementing conditional logic with more than two branches.

**Properties**

- **Node Paths**: The list of paths to take based on the condition evaluation.
- **Node Path Rules**: Each rule is associated with a path and is evaluated to determine the path to take.
- **Rule Conditions**: The conditions to evaluate for each path.
- **Actions**: (Optional) The actions to execute traversing to the next node along the path.

---

### Logical Timer Node
**Node Features**
- Waits for a specified duration and then evaluates a rule.
- There are 2 paths to take based on the rule evaluation: Successful logical evaluation or Time-out.
- After time-out, if the rule evaluates to true, the successful path is taken.
- After time-out, if the rule evaluates to false, the timed out path is taken.

**Some Examples**
- Sending a reminder if a user has not completed an action within a time frame.
- Cancelling an order if payment is not received within a specified period.
- Escalating a support ticket if not resolved within a certain time.
- Sending a follow-up email after a delay if a user has not responded.

**Use Cases**
- Basically used for checking whether a condition is met after a certain time.
- Implementing time-based triggers with conditional logic.
- Automating actions based on time and business rules.
- Handling time-sensitive processes with rule-based decisions.

**Properties**

- **DelaySeconds**: The time to wait before evaluating the rule.
- **Rule**: The rule to evaluate after the duration.
- **Next NodeId On Success**: The next node to transition to if the rule evaluates to true.
- **Next NodeId On Timeout**: The next node to transition to if the rule evaluates to false.
- **Number of Retries**: The number of times to retry the rule evaluation if it fails.

---

### Timer Node
**Node Features**
- Can be used as a free node or part of the workflow graph.
- Delays execution for a specified period before proceeding to the next node.
- The delay is defined in seconds, though actual delay could be in minutes, hours or days.
- The node can be used to schedule actions or transitions after a specific time interval.
- No conditions or rules are evaluated; the node simply waits for the specified duration before moving to the next node.

**Use Cases**
- Long duration scheduling of the tasks.
- Implementing time-based triggers for notifications.
- Implementing wait times before retrying an operation.
- Scheduling a reminder for a user.

**Properties**

- **DelaySeconds**: The time to wait before transitioning to the next node.
- **Next Node**: The next node to transition to after the timer expires.

---

### Terminator Node
**Node Features**
- Marks the end of a workflow execution.
- Execution of this nodes terminates the schema instance and marks it as 'Terminated'.
- No further transitions occur in the schema instance after reaching this node.
- If there are any children schema instances, they are also terminated.
- Child schema instances are the ones triggered by the parent schema instance.
- Children schema instances are terminated before the parent schema instance.

**Use Cases**
- Closing a workflow after successful or unsuccessful completion.
- Handling error scenarios where the workflow cannot proceed.

---

### Broadcaster Node
**Node Features**
- Broadcasts a message or notification to multiple recipients.
- Is always a free node and not part of the main workflow graph.
- Can be triggered through a pre-defined node action.
- Keeps a list of recipients to send a message or notification.
- Receives a broadcast message which is a special type of message.
- Can receive a message from another schema instance.
- Sends notifications or messages to multiple recipients in the system.
- The recipients can be users, channels or API endpoints.

**Use Cases**
- Broadcasting updates to users or services.
- Sending mass email or SMS alerts.

**Properties**

- **Input**: The standard input node params containing a list of recipients to broadcast the message to.

---

### Idle Node
**Node Features**
- Represents an inactive state where the workflow simply waits doing nothing, but logging the state.
- Requires an intervention to resume execution, in the form of a specific event.
- The workflow remains in this state until the specified event is received.
- Mostly useful for sub-workflows or long-running processes.

**Use Cases**
- Handling manual approval processes or long-term waiting scenarios.
- Suspending a process until a supervisor manually resumes it.

---

