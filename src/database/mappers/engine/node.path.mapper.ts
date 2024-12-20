import { NodePathResponseDto } from '../../../domain.types/engine/node.path.types';
import { NodePath } from '../../../database/models/engine/node.path.model';

///////////////////////////////////////////////////////////////////////////////////

export class NodePathMapper {

    static toResponseDto = (path: NodePath): NodePathResponseDto => {
        if (path == null) {
            return null;
        }
        const dto: NodePathResponseDto = {
            id          : path.id,
            Name        : path.Name,
            Description : path.Description,
            ParentNode  : path.ParentNode ? {
                id          : path.ParentNode.id,
                Name        : path.ParentNode.Name,
                Description : path.ParentNode.Description,
            }          : null,
            Rule : path.Rule ? {
                id          : path.Rule.id,
                Name        : path.Rule.Name,
                Description : path.Rule.Description,
            } : null,
            NextNode  : path.NextNode,
            CreatedAt : path.CreatedAt,
            UpdatedAt : path.UpdatedAt,
        };
        return dto;
    };

}
