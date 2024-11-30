import { Rule } from '../../models/engine/rule.model';
import {
    RuleResponseDto
} from '../../../domain.types/engine/rule.domain.types';

///////////////////////////////////////////////////////////////////////////////////

export class RuleMapper {

    static toResponseDto = (rule: Rule): RuleResponseDto => {
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
            Condition : {
                id       : rule.Condition.id,
                Name     : rule.Condition.Name,
                Operator : rule.Condition.Operator,
            },
            NodePath : {
                id          : rule.NodePath.id,
                Name        : rule.NodePath.Name,
                Description : rule.NodePath.Description,
                NextNode    : {
                    id          : rule.NodePath.NextNode.id,
                    Name        : rule.NodePath.NextNode.Name,
                    Code        : rule.NodePath.NextNode.Code,
                    Description : rule.NodePath.NextNode.Description,
                }
            },
            CreatedAt : rule.CreatedAt,
            UpdatedAt : rule.UpdatedAt,
        };
        return dto;
    };

}
