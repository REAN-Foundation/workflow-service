import { NodeInstance } from '../../models/engine/node.instance.model';
import {
    NodeInstanceResponseDto
} from '../../../domain.types/engine/node.instance.types';

///////////////////////////////////////////////////////////////////////////////////

export class NodeInstanceMapper {

    static toResponseDto = (instance: NodeInstance): NodeInstanceResponseDto => {
        if (instance == null) {
            return null;
        }
        const dto: NodeInstanceResponseDto = {
            id                    : instance.id,
            ExecutionStatus       : instance.ExecutionStatus,
            StatusUpdateTimestamp : instance.StatusUpdateTimestamp,
            ExecutionResult       : instance.ExecutionResult ?? null,
            Node                  : {
                id   : instance.Node.id,
                Type : instance.Node.Type,
                Name : instance.Node.Name,
            },
            SchemaInstance : {
                id     : instance.SchemaInstance.id,
                Schema : instance.SchemaInstance.Schema ? {
                    id          : instance.SchemaInstance.Schema.id,
                    Name        : instance.SchemaInstance.Schema.Name,
                    Description : instance.SchemaInstance.Schema.Description,
                } : null
            },
            ParentNodeInstance : instance.ParentNodeInstance ? {
                id   : instance.ParentNodeInstance.id,
                Node : instance.ParentNodeInstance.Node ? {
                    id   : instance.ParentNodeInstance.Node.id,
                    Name : instance.ParentNodeInstance.Node.Name,
                } : null
            } : null,
            ChildrenNodeInstances : instance.ChildrenNodeInstances ? instance.ChildrenNodeInstances.map(x => {
                return {
                    id   : x.id,
                    Node : x.Node ? {
                        id   : x.Node.id,
                        Name : x.Node.Name,
                    } : null
                };
            }) : [],
            CreatedAt : instance.CreatedAt,
            UpdatedAt : instance.UpdatedAt,
        };
        return dto;
    };

}
