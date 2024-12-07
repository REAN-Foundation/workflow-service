import { SchemaInstance } from '../../models/engine/schema.instance.model';
import {
    SchemaInstanceResponseDto
} from '../../../domain.types/engine/schema.instance.types';

///////////////////////////////////////////////////////////////////////////////////

export class SchemaInstanceMapper {

    static toResponseDto = (instance: SchemaInstance): SchemaInstanceResponseDto => {
        if (instance == null) {
            return null;
        }
        const dto: SchemaInstanceResponseDto = {
            id     : instance.id,
            Schema : {
                id          : instance.Schema.id,
                Name        : instance.Schema.Name,
                Description : instance.Schema.Description,
                TenantId    : instance.Schema.TenantId,
            },
            RootNodeInstance : instance.RootNodeInstance ? {
                id   : instance.RootNodeInstance.id,
                Node : instance.RootNodeInstance.Node ? {
                    id   : instance.RootNodeInstance.Node.id,
                    Name : instance.RootNodeInstance.Node.Name,
                } : null,
            } : null,
            CurrentNodeInstance : instance.CurrentNodeInstance ? {
                id   : instance.CurrentNodeInstance.id,
                Node : instance.CurrentNodeInstance.Node ? {
                    id   : instance.CurrentNodeInstance.Node.id,
                    Name : instance.CurrentNodeInstance.Node.Name,
                } : null,
            } : null,
            NodeInstances : instance.NodeInstances ? instance.NodeInstances.map(x => {
                return {
                    id   : x.id,
                    Node : x.Node ? {
                        id   : x.Node.id,
                        Name : x.Node.Name,
                    } : null
                };
            }) : [],
            Almanac                   : instance.Almanac,
            ContextParams             : instance.ContextParams,
            ExecutionStarted          : instance.ExecutionStarted,
            ExecutionStartedTimestamp : instance.ExecutionStartedTimestamp,
            CreatedAt                 : instance.CreatedAt,
            UpdatedAt                 : instance.UpdatedAt,
        };
        return dto;
    };

}
