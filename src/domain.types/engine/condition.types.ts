import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import {
    CompositionOperatorType,
    LogicalOperatorType,
    OperatorType } from "./engine.enums";
import { ConditionOperand } from "./rule.types";

//////////////////////////////////////////////////////////////

export interface ConditionCreateModel {
    Name                    : string;
    Description            ?: string;
    ParentRuleId            : uuid;
    ParentConditionId       : uuid;
    NodePathId             ?: uuid;
    ParentNodeId           ?: uuid;
    OperatorType           ?: OperatorType;
    LogicalOperatorType    ?: LogicalOperatorType;
    CompositionOperatorType?: CompositionOperatorType;
    FirstOperand           ?: ConditionOperand;
    SecondOperand          ?: ConditionOperand;
    ThirdOperand           ?: ConditionOperand;

    // Fact                 ?: string;
    // DataType              : OperandDataType;
    // Value                ?: any;
}

export interface ConditionUpdateModel {
    Name                   ?: string;
    Description            ?: string;
    ParentRuleId           ?: uuid;
    ParentConditionId      ?: uuid;
    NodePathId             ?: uuid;
    ParentNodeId           ?: uuid;
    OperatorType           ?: OperatorType;
    LogicalOperatorType    ?: LogicalOperatorType;
    CompositionOperatorType?: CompositionOperatorType;
    FirstOperand           ?: ConditionOperand;
    SecondOperand          ?: ConditionOperand;
    ThirdOperand           ?: ConditionOperand;
}

export interface ConditionResponseDto {
    id                      : uuid;
    Name                    : string;
    Description            ?: string;
    ParentRuleId            : uuid;
    ParentConditionId       : uuid;
    NodePathId             ?: uuid;
    ParentNodeId           ?: uuid;
    OperatorType           ?: OperatorType;
    LogicalOperatorType    ?: LogicalOperatorType;
    CompositionOperatorType?: CompositionOperatorType;
    FirstOperand           ?: ConditionOperand;
    SecondOperand          ?: ConditionOperand;
    ThirdOperand           ?: ConditionOperand;
    // ParentRule              : {
    //     id          : uuid;
    //     Name        : string;
    //     Description : string;
    //     ParentNodeId: uuid;
    // };
    // ParentCondition : {
    //     id: uuid;
    //     Name: string;
    //     Description: string;
    // }
    // ChildrenConditions : {
    //     id: uuid;
    //     Name: string;
    //     Description: string;
    // }[];
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface ConditionSearchFilters extends BaseSearchFilters {
    Name             ?: string;
    ParentRuleId     ?: uuid;
    ParentConditionId?: uuid;
}

export interface ConditionSearchResults extends BaseSearchResults {
    Items: ConditionResponseDto[];
}
