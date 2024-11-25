import { Node } from '../../models/engine/node.model';
import {
    NodeResponseDto
} from '../../../domain.types/engine/node.types';
import { Question } from '../../../database/models/engine/question.model';

///////////////////////////////////////////////////////////////////////////////////

export class NodeMapper {

    static toResponseDto = (node: Node, question?: Question): NodeResponseDto => {
        if (node == null) {
            return null;
        }
        const dto: NodeResponseDto = {
            id          : node.id,
            Type        : node.Type,
            Name        : node.Name,
            Description : node.Description,
            Schema      : {
                id          : node.Schema.id,
                Name        : node.Schema.Name,
                Description : node.Schema.Description,
            },
            ParentNode : node.ParentNode ? {
                id          : node.ParentNode.id,
                Name        : node.ParentNode.Name,
                Description : node.ParentNode.Description,
            }          : null,
            Children : node.Children ? node.Children.map(x => {
                return {
                    id          : x.id,
                    Name        : x.Name,
                    Description : x.Description,
                };
            }) : [],
            Question : question ? question.QuestionText : null,
            Options  : question ? question.Options?.map(x => {
                return {
                    id       : x.id,
                    Text     : x.Text,
                    ImageUrl : x.ImageUrl,
                    Sequence : x.Sequence,
                    Metadata : x.Metadata,
                };
            }) : null,

            CreatedAt : node.CreatedAt,
            UpdatedAt : node.UpdatedAt,
        };
        return dto;
    };

}
