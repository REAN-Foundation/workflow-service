import { NodeActionResponseDto } from '../../../domain.types/engine/node.action.types';
import { NodeAction } from '../../models/engine/node.action.model';

///////////////////////////////////////////////////////////////////////////////////

export class NodeActionMapper {

    static toResponseDto = (path: NodeAction): NodeActionResponseDto => {
        if (path == null) {
            return null;
        }
        const dto: NodeActionResponseDto = {
            id          : path.id,
            ActionType  : path.ActionType,
            Name        : path.Name,
            Description : path.Description,
            ParentNode  : path.ParentNode ? {
                id          : path.ParentNode.id,
                Name        : path.ParentNode.Name,
                Description : path.ParentNode.Description,
            }          : null,
            Input     : path.Input,
            Output    : path.Output,
            CreatedAt : path.CreatedAt,
            UpdatedAt : path.UpdatedAt,
        };
        return dto;
    };

}
