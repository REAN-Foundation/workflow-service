# Node Rule

Node rule is a decision rule associated with the node. A rule in itself does not have a logic but has a hierarchical set of conditions within them. Starting with base condition, it can have multiple conditions within it. Each condition can have multiple sub-conditions. The rule is evaluated based on the conditions and the execution moves to the next node based on the evaluation.

Node rule is optional. Only certain nodes with decision-making capabilities have a rule associated with them.

## Condition

A condition can be of multiple types based on the condition operator type.

1. **Composite Operator** - A composite condition is a combination of multiple conditions. It can be a combination of `AND` or `OR` conditions. The composite condition is evaluated based on the evaluation of the sub-conditions.

2. **Logical Operator** - A simple condition is a single condition. It evaluates to `true` or `false` based on the evaluation of the condition. It may have 1 (For example - IsEmpty, IsNotEmpty) or 2 (For example - Equals, NotEquals) or even 3 (For example - Between) operands. Following are the logical operators which are supported.
      - Equal
      - NotEqual
      - GreaterThan
      - GreaterThanOrEqual
      - LessThan
      - LessThanOrEqual
      - In
      - NotIn
      - Contains
      - IsEmpty
      - IsNotEmpty
      - DoesNotContain
      - Between
      - IsTrue
      - IsFalse
      - Exists
      - HasConsecutiveOccurrences
      - RangesOverlap
      - None

3. **Mathematical Operator** - A mathematical Operator is used to process certain input operands and acts as an input to the operands of the logical operator. For example, `Add`, `Subtract`, `Multiply`, `Divide`, `Modulus`, `Power`.

Conditions are evaluated in the hierarchical order by "Condition Processor'. The evaluation starts from the base condition in recursive manner and moves to the sub-conditions. Finally the base condition is evaluated based on the evaluation of the sub-conditions and so on. The evaluation result ('true' or 'false') is the result of the parent node rule.

### Condition Object

```json
  {
    "Name": "Base rule condition for option 1",
    "Description": "This is the base rule condition for the first option. Mark the incident as handled.",
    "ParentRuleId": "{{MAIN_QN1_PATH_1_RULE_ID}}",
    "ParentConditionId": null,
    "OperatorType": "Logical",
    "LogicalOperatorType": "Equal",
    "FirstOperand": {
      "DataType": "Integer",
      "Name": "Expected option sequence",
      "Value": 1
    },
    "SecondOperand": {
      "DataType": "Integer",
      "Name": "Chosen option sequence",
      "Value": null,
      "Source": "UserEvent",
      "Key": "QuestionResponse:ChosenOptionSequence"
    }
  }
}
```

### Condition Operands
Each operand object contains the following properties:
- **DataType** - The data type of the operand.
- **Name** - The name of the operand.
- **Value** - The value of the operand.

```json
{
  "DataType": "Integer",
  "Name": "Expected option sequence",
  "Value": 1
}
```
