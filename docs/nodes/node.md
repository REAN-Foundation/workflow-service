# Nodes

Nodes are the building blocks of the workflow. Each node represents a step in the workflow. The node can be a simple step or a complex step with multiple actions. The node can be a logical step (a decision point) or a task step. The nodes can be connected nodes or free nodes. Free nodes generally listen to events or timers and are not part of the main or secondary workflow graphs. Connected nodes are part of the main or secondary workflow graphs or node chains.

Here is the simple example.

```mermaid
graph TD;
    Start([Start - Root Node]) --> A[Execution Node]
    A -->|Decision| B{"❓ Yes/No Node"}
    B -- Yes --> C[Execution Node]
    B -- No --> D[Idle Node]
    C -- Triggers --> E[Broadcaster Node]
    D -->|Waits for Event| F[Event Listener Node]
    C --> G["⏰ Timer Node"]
    F --> H{Question Node}
    G --> Terminator([End - Terminator Node])
    H -- Path X --> Terminator
    H -- Path Y --> A
```

## Types of Nodes

Currently following types of the nodes are supported:

- [Execution Node](nodes/node.md#execution-node)
- [Question Node](nodes/node.md#question-node)
- [Event Listener Node](nodes/node.md#event-listener-node)
- [Logical Yes-No Action Node](nodes/node.md#logical-yes-no-action-node)
<!-- - [Logical Node](nodes/node.md#logical-node) -->
- [Logical Timer Node](nodes/node.md#logical-timer-node)
- [Timer Node](nodes/node.md#timer-node)
- [Terminator Node](nodes/node.md#terminator-node)
- [Broadcaster Node](nodes/node.md#broadcaster-node)
- [Idle Node](nodes/node.md#idle-node)

## Node Properties

Every node has some common properties. These are:

1. [Node Actions](nodes/node-actions.md#node-actions) - *Node actions or tasks are the actions associated with the node. These actions are executed when the node is triggered. Node execution does not move to the next node until all the actions are executed successfully.*
2. [Node Rule](nodes/node-rule.md#node-rule) - *(Optional) A decision rule associated with the node. A rule may have hierarchical set of conditions within them.*
3. **Node Input** - *(Optional) This is input data expected for a particular type of the node. This is a set of Params defined when a node is expecting certain kind of input. The input may be an event or the state of the schema instance. Once this input is fulfilled, it proceeds to the execution. Only applicable for certain kind of nodes, such as "Event Listener Node'.*
4. **Node Execution Delay** - *(Optional) This is the delay before the node actions are executed. This is defined in seconds*

In addition to these, there are some specific properties which change according to the node type.
