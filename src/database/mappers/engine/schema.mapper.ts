import { Schema } from '../../models/engine/schema.model';
import { Node } from '../../models/engine/node.model';
import {
    SchemaResponseDto
} from '../../../domain.types/engine/schema.domain.types';

///////////////////////////////////////////////////////////////////////////////////

export class SchemaMapper {

    static toResponseDto = (schema: Schema, rootNode: Node): SchemaResponseDto => {
        if (schema == null) {
            return null;
        }
        const dto: SchemaResponseDto = {
            id          : schema.id,
            Type        : schema.Type,
            TenantId    : schema.TenantId,
            Name        : schema.Name,
            Description : schema.Description,
            RootNode    : rootNode ? {
                id          : rootNode.id,
                Description : rootNode.Description,
                Name        : rootNode.Name,
                Type        : rootNode.Type,
                Actions     : rootNode.Actions,
            } : null,
            ContextParams : schema.ContextParams,
            CreatedAt     : schema.CreatedAt,
            UpdatedAt     : schema.UpdatedAt,
        };
        return dto;
    };

}
