# Node Actions

By default, each node carries a set of actions. These actions are executed when the node is traversed. The actions are defined in the node configuration. The actions are executed in the order with specified sequence.

**Path Actions**
Some of the actions are called as 'Path Actions' as they are used to traverse the path of the workflow. These actions are used to move the workflow from one node to another. For example, actions belonging to `Event Listener Conditional Node` are `YesAction` and `NoAction`. Based on the condition evaluation, the respective action is executed, which results in the workflow moving to the next node. Path actions are executed separately from the regular node actions.

## Action Execution

Actions are executed in predefined sequence. Whenever the actions are added to the node, the node execution is considered to be incomplete until all the actions are executed successfully. Otherwise the `Execution` status of the node is set to `false`.

## Action Types
