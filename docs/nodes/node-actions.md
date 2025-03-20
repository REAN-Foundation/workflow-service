# Node Actions

By default, each node carries a set of actions. These actions are executed when the node is traversed. The actions are defined in the node configuration. The actions are executed in the order with specified sequence.

**Path Actions**
Some of the actions are called as 'Path Actions' as they are used to traverse the path of the workflow. These actions are used to move the workflow from one node to another. For example, actions belonging to `Event Listener Conditional Node` are `YesAction` and `NoAction`. Based on the condition evaluation, the respective action is executed, which results in the workflow moving to the next node. Path actions are executed separately from the regular node actions.

## Action Execution

Actions are executed in predefined sequence. Whenever the actions are added to the node, the node execution is considered to be incomplete until all the actions are executed successfully. Otherwise the `Execution` status of the node is set to `false`.

## Action Instance

Each action instance is instantiation of the node action. During the execution of the node instance, the action instances are created and executed. The action instance is created based on the action configuration.

## Types of Actions

Currently, the following types of node actions are supported:

### Event and Timer Actions
- **TriggerEventListenerNode**: Triggers an event listener node to listen for a specific event.
- **TriggerTimerNode**: Initiates a timer-based node that executes after a defined delay.
- **TriggerLogicalTimerNode**: Triggers a logical timer that determines execution based on a logical condition.

### Workflow Execution Actions
- **TriggerChildWorkflow**: Starts a child workflow as part of the execution sequence.
- **TriggerMultipleChildrenWorkflow**: Starts multiple child workflows concurrently.

### Messaging Actions
- **SendMessage**: Sends a message to a specified recipient.
- **SendMultipleMessagesToOneUser**: Sends multiple messages to a single user.
- **SendOneMessageToMultipleUsers**: Sends a single message to multiple users.
- **SendEmail**: Sends an email to a recipient.
- **SendSms**: Sends an SMS message to a recipient.

### Flow Control Actions
- **SetNextNode**: Determines the next node to execute in the workflow.
- **Exit**: Ends the current workflow execution.
- **Continue**: Proceeds to the next step in the workflow execution.

### External API and Function Calls
- **RestApiCall**: Makes an HTTP request to an external REST API.
- **PythonFunCall**: Executes a function written in Python.
- **LambdaFunCall**: Invokes an AWS Lambda function.

### Database Operations
- **StoreToSqlDb**: Stores data in an SQL database.
- **GetFromSqlDb**: Retrieves data from an SQL database.

### Almanac (State Management) Operations
- **StoreToAlmanac**: Stores a value in the almanac (context store).
- **ExistsInAlmanac**: Checks whether a value exists in the almanac.
- **GetFromAlmanac**: Retrieves a value from the almanac.

### Context Management Actions
- **UpdateContextParams**: Updates parameters in the workflow execution context.
- **GenerateRandomCode**: Generates a random code for use in workflow execution.

### Array Operations
- **ArraySort**: Sorts an array based on specified criteria.
- **ArrayFilter**: Filters elements in an array according to a condition.
- **ArrayGetElement**: Retrieves an element from an array at a specified index.

### Object and Text Manipulation
- **GetObjectParam**: Extracts a specific parameter from an object.
- **ConstructTextArrayFromTemplate**: Constructs an array of text elements using a template.
- **ConstructTextFromTemplate**: Generates text output based on a template.
- **ConstructObject**: Constructs an object from provided data.

