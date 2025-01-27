import { Schema } from '../../models/engine/schema.model';
import { Node } from '../../models/engine/node.model';
import {
    SchemaResponseDto
} from '../../../domain.types/engine/schema.domain.types';
import { NodeActionMapper } from './node.action.mapper';

///////////////////////////////////////////////////////////////////////////////////

export class SchemaMapper {

    static toResponseDto = (schema: Schema, rootNode: Node): SchemaResponseDto => {
        if (schema == null) {
            return null;
        }
        const dto: SchemaResponseDto = {
            id                 : schema.id,
            Type               : schema.Type,
            TenantId           : schema.TenantId,
            TenantCode         : schema.TenantCode,
            Name               : schema.Name,
            Description        : schema.Description,
            ParentSchemaId     : schema.ParentSchemaId,
            ExecuteImmediately : schema.ExecuteImmediately,
            RootNode           : rootNode ? {
                id          : rootNode.id,
                Description : rootNode.Description,
                Name        : rootNode.Name,
                Type        : rootNode.Type,
                Actions     : rootNode.Actions ? rootNode.Actions.map(x => NodeActionMapper.toResponseDto(x)) : null,
                NextNodeId  : rootNode.NextNodeId,
            } : null,
            ContextParams : schema.ContextParams,
            CreatedAt     : schema.CreatedAt,
            UpdatedAt     : schema.UpdatedAt,
        };
        return dto;
    };

}
