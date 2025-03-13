# Logical Event Node

Also called as `Event-Listening-Yes-No-Node`.

This node waits for events and once the event is received it evaluates the condition. This node need not have any generic actions associated with it as it has two default actions. Yes-Action and No-Action. Based on the condition evaluation, the respective action is executed.

## Properties

- **Event**: The event to listen for. This is generally of type UserEvent.
- **Rule**: The rule with a condition to evaluate.
- **Yes-Action**: The action to execute if the condition is true.
- **No-Action**: The action to execute if the condition is false.

It is not a free node but part of the workflow graph.

The `traverseConditionalEventNode` method handles the traversal of a node that has conditional logic based on a rule. It evaluates the rule and executes the corresponding action (YesAction or NoAction) based on the result of the rule evaluation.

## Detailed Steps of the Node Traversal

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
