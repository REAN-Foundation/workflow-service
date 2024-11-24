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
            id     : schema.id,
            Type   : schema.Type,
            Client : schema.Client ? {
                id   : schema.Client.id,
                Name : schema.Client.Name,
                Code : schema.Client.Code,
            } : null,
            Name        : schema.Name,
            Description : schema.Description,
            ValidFrom   : schema.ValidFrom,
            ValidTill   : schema.ValidTill,
            IsValid     : schema.IsValid,
            RootNode    : rootNode ? {
                id          : rootNode.id,
                Description : rootNode.Description,
                Name        : rootNode.Name,
                Type        : rootNode.Type,
            } : null,
            CreatedAt : schema.CreatedAt,
            UpdatedAt : schema.UpdatedAt,
        };
        return dto;
    };

}
