# Workflow Nodes

## Types of Nodes

There are two types of nodes in the workflow- Free nodes and Graph nodes.

**Free Nodes**: These nodes are not part of the workflow graph and can be executed independently. They are also called as floating node. They are not connected to main graph of the workflow as they are supposed to act asynchrounously. Eventhough they are not connected to main graph node, they can have their own node chain with these nodes as starting nodes.

Examples of free nodes include `EventListenerNode`, `TimerNode`.

- [Event Listener Node](event-listener-node.md)
- [Timer Node](timer-node.md)

**Graph Nodes**: These nodes are part of the either main workflow graph or are connected to free-node chains. They are also called as workflow graph nodes.
Following are the examples of graph nodes:

- [Execution Node](execution-node.md)
- [Logical Event Node](logical-event-node.md)
- [Logical Timer Node](logical-timer-node.md)
- [Timer Node](timer-node.md)
- [Question Node](question-node.md)
- [Terminator Node](terminator-node.md)

## Node Members

1. [Node Actions](node-actions.md)
2. [Node Rule](node-rule.md) - *Optional rule associated with the node.*
3. [Node Execution Delay](node-execution-delay.md) - *Optional delay before the node actions are executed.*
4. [Node Input](node-input.md) - *Optional input data expected for the node.*

In addition to these, there are some node specific properties.
