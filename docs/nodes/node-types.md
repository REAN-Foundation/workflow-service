# Node Types

Each node type serves a specific function in processing tasks, handling events, executing logic, or controlling the flow of execution.
These node types collectively define the structure and behavior of workflows, allowing for flexible automation, decision-making, and event handling. Each node plays a specific role in managing workflow execution, ensuring defined processing of tasks and decisions.

## Node Types

### Execution Node
**Description:**
- Represents a task that performs an operation within the workflow.
- Executes a predefined action and transitions to the next node.

**Use Case:**
- Performing API calls, computations, or database operations.
- Sending an email notification to a user.
- Logging data for analytics purposes.

**Example:**
```json
{
  "type": "ExecutionNode",
  "action": "send_email",
  "next": "B"
}
```

---

### Question Node
**Description:**
- Represents a decision point where user or system input is required.
- Workflow pauses until an answer is provided.

**Use Case:**
- Asking users for input or validation before proceeding.
- Requesting confirmation before processing a transaction.

**Example:**
```json
{
  "type": "QuestionNode",
  "question": "Do you want to proceed?",
  "options": ["Yes", "No"],
  "next": {
    "Yes": "C",
    "No": "D"
  }
}
```

---

### Event Listener Node
**Description:**
- Waits for a specific event to occur before continuing execution.
- Listens for external system signals or user interactions.

**Use Case:**
- Handling real-time events such as messages from an external service.
- Listening for a webhook response before proceeding.

**Example:**
```json
{
  "type": "EventListenerNode",
  "event": "payment_received",
  "next": "E"
}
```

---

### Logical Yes-No Action Node
**Description:**
- Evaluates a condition and routes the workflow based on a yes/no (true/false) decision.

**Use Case:**
- Conditional branching based on user choices or system state.
- Checking if a user is eligible for a discount.

**Example:**
```json
{
  "type": "LogicalYesNoActionNode",
  "condition": "user.has_premium_account",
  "next": {
    "true": "F",
    "false": "G"
  }
}
```

---

### Logical Event Node
**Description:**
- Listens for an event and evaluates a condition before proceeding to the next node.
- Combines event listening with conditional logic.
- Similar to EventListenerNode but with additional rule-based processing.

**Use Case:**
- Triggering actions based on event data and business rules.

**Example:**
```json
{
  "type": "LogicalEventNode",
  "event": "order_shipped",
  "rule": "if order.total > 100 then send_discount()",
  "next": "H"
}
```

---

### Logical Timer Node
**Description:**
- Combines a timer with conditional logic to execute actions after a delay.
- Waits for a specified duration and evaluates a rule before proceeding.
- Similar to TimerNode but with additional rule-based processing.
- Useful for time-based triggers with conditional logic.
- Example: Sending a reminder if a user has not completed an action within a time frame.
- Example: Cancelling an order if payment is not received within a specified period.
- Example: Escalating a support ticket if not resolved within a certain time.
- Example: Sending a follow-up email after a delay if a user has not responded.
  
**Use Case:**
- Implementing time-based triggers with conditional logic.
- Automating actions based on time and business rules.
- Handling time-sensitive processes with rule-based decisions.

**Example:**
```json
{
  "type": "LogicalTimerNode",
  "duration": "24h",
  "rule": "if order.status == 'pending' then cancel_order()",
  "next": "I"
}
```

### Timer Node
**Description:**
- Delays execution for a specified period before proceeding to the next node.

**Use Case:**
- Implementing wait times before retrying an operation.
- Scheduling a reminder for a user.

**Example:**
```json
{
  "type": "TimerNode",
  "duration": "30m",
  "next": "H"
}
```

---

### Logical Timer Node
**Description:**
- Similar to TimerNode but also executes a rule-based logic when the timer expires.

**Use Case:**
- Running business rules or automated actions after a timeout.
- Marking an order as expired if payment is not received within a time frame.

**Example:**
```json
{
  "type": "LogicalTimerNode",
  "duration": "24h",
  "logic": "if order.status == 'pending' then cancel_order()",
  "next": "I"
}
```

---

### Terminator Node
**Description:**
- Marks the end of a workflow execution.
- No further transitions occur after reaching this node.

**Use Case:**
- Closing a workflow after successful or unsuccessful completion.
- Archiving workflow logs for reporting purposes.

**Example:**
```json
{
  "type": "TerminatorNode"
}
```

---

### Broadcaster Node
**Description:**
- Sends notifications or messages to multiple recipients in the system.

**Use Case:**
- Broadcasting updates to users or services.
- Sending mass email or SMS alerts.

**Example:**
```json
{
  "type": "BroadcastNode",
  "message": "System update scheduled for midnight",
  "recipients": ["admins", "users"]
}
```

---

### Idle Node
**Description:**
- Represents an inactive state where the workflow is paused indefinitely.
- Requires external intervention to resume execution.

**Use Case:**
- Handling manual approval processes or long-term waiting scenarios.
- Suspending a process until a supervisor manually resumes it.

**Example:**
```json
{
  "type": "IdleNode",
  "resume_event": "manager_approval"
}
```

---

