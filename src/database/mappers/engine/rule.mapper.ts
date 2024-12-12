import { Rule } from '../../models/engine/rule.model';
import {
    RuleResponseDto
} from '../../../domain.types/engine/rule.domain.types';
import { ConditionResponseDto } from '../../../domain.types/engine/condition.types';

///////////////////////////////////////////////////////////////////////////////////

export class RuleMapper {

    static toResponseDto = (rule: Rule, condition?: ConditionResponseDto): RuleResponseDto => {
        if (rule == null) {
            return null;
        }
        const dto: RuleResponseDto = {
            id          : rule.id,
            Name        : rule.Name,
            Description : rule.Description,
            ParentNode  : rule.ParentNode ? {
                id          : rule.ParentNode.id,
                Name        : rule.ParentNode.Name,
                Description : rule.ParentNode.Description,
            }          : null,
            ConditionId : rule.ConditionId,
            Condition   : condition ?? null,
            NodePath    : rule.NodePath ? {
                id          : rule.NodePath.id,
                Name        : rule.NodePath.Name,
                Description : rule.NodePath.Description,
                NextNode    : {
                    id          : rule.NodePath.NextNode.id,
                    Name        : rule.NodePath.NextNode.Name,
                    Code        : rule.NodePath.NextNode.Code,
                    Description : rule.NodePath.NextNode.Description,
                }
            } : null,
            CreatedAt : rule.CreatedAt,
            UpdatedAt : rule.UpdatedAt,
        };
        return dto;
    };

}
