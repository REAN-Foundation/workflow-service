import { NodeInstance } from '../../models/engine/node.instance.model';
import {
    NodeActionInstanceResponseDto,
    NodeInstanceResponseDto
} from '../../../domain.types/engine/node.instance.types';
import { NodeActionInstance } from '../../../database/models/engine/node.action.instance.model';
import { NodeActionResponseDto } from '../../../domain.types/engine/node.action.types';
import { NodeMapper } from './node.mapper';

///////////////////////////////////////////////////////////////////////////////////

export class NodeInstanceMapper {

    static toResponseDto = (
        instance: NodeInstance,
        actionInstances?: NodeActionInstanceResponseDto[])
        : NodeInstanceResponseDto => {

        if (instance == null) {
            return null;
        }
        const dto: NodeInstanceResponseDto = {
            id                    : instance.id,
            ExecutionStatus       : instance.ExecutionStatus,
            StatusUpdateTimestamp : instance.StatusUpdateTimestamp,
            ExecutionResult       : instance.ExecutionResult ?? null,
            Node                  : instance.Node ? NodeMapper.toResponseDto(instance.Node) : null,
            SchemaInstance        : instance.SchemaInstance ? {
                id     : instance.SchemaInstance.id,
                Schema : instance.SchemaInstance.Schema ? {
                    id          : instance.SchemaInstance.Schema.id,
                    Name        : instance.SchemaInstance.Schema.Name,
                    Description : instance.SchemaInstance.Schema.Description,
                } : null
            } : null,
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
            ActionInstances             : actionInstances,
            TimerNumberOfTriesCompleted : instance.TimerNumberOfTriesCompleted,
            CreatedAt                   : instance.CreatedAt,
            UpdatedAt                   : instance.UpdatedAt,
        };
        return dto;
    };

    static toNodeActionInstanceResponseDto = (instance: NodeActionInstance, action?: NodeActionResponseDto): NodeActionInstanceResponseDto => {
        if (instance == null) {
            return null;
        }
        const dto: NodeActionInstanceResponseDto = {
            id                 : instance.id,
            ActionType         : instance.ActionType,
            Sequence           : instance.Sequence,
            NodeId             : instance.NodeId,
            NodeInstanceId     : instance.NodeInstanceId,
            ActionId           : instance.ActionId,
            SchemaInstanceId   : instance.SchemaInstanceId,
            Executed           : instance.Executed,
            ExecutionTimestamp : instance.ExecutionTimestamp,
            Input              : instance.Input,
            Output             : instance.Output,
            Action             : action ?? null,
            CreatedAt          : instance.CreatedAt,
            UpdatedAt          : instance.UpdatedAt,
        };
        return dto;
    };

}
