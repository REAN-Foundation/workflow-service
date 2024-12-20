import { Condition } from '../../models/engine/condition.model';
import {
    ConditionResponseDto
} from '../../../domain.types/engine/condition.types';

///////////////////////////////////////////////////////////////////////////////////

export class ConditionMapper {

    static toResponseDto = (condition: Condition): ConditionResponseDto => {
        if (condition == null) {
            return null;
        }
        const dto: ConditionResponseDto = {
            id                      : condition.id,
            Name                    : condition.Name,
            Description             : condition.Description,
            ParentRuleId            : condition.ParentRuleId,
            ParentConditionId       : condition.ParentConditionId,
            NodePathId              : condition.NodePathId,
            ParentNodeId            : condition.ParentNodeId,
            OperatorType            : condition.OperatorType,
            LogicalOperatorType     : condition.LogicalOperatorType,
            CompositionOperatorType : condition.CompositionOperatorType,
            FirstOperand            : condition.FirstOperand,
            SecondOperand           : condition.SecondOperand,
            ThirdOperand            : condition.ThirdOperand,
            CreatedAt               : condition.CreatedAt,
            UpdatedAt               : condition.UpdatedAt,
        };
        return dto;
    };

}
