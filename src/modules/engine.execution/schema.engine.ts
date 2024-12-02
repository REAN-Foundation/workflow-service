import { ExecutionStatus, NodeType, ParamType } from '../../domain.types/engine/engine.enums';
import { SchemaInstanceResponseDto } from '../../domain.types/engine/schema.instance.types';
import { EventResponseDto } from '../../domain.types/engine/event.types';
import { SchemaResponseDto } from '../../domain.types/engine/schema.domain.types';
import { NodeService } from "../../database/services/engine/node.service";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { NodeInstanceResponseDto } from '../../domain.types/engine/node.instance.types';
import { formatDateToYYMMDD } from './engine.utils';
import { uuid } from '../../domain.types/miscellaneous/system.types';
import { NodeInstance } from '../../database/models/engine/node.instance.model';
import { logger } from '../../logger/logger';
import { XExecutionNode, XQuestionNode, XListeningNode, XWaitNode, XNodeInstance } from '../../domain.types/engine/intermediate.types/intermediate.types';
import { NodeInstanceService } from '../../database/services/engine/node.instance.service';
import { NodeResponseDto } from '../../domain.types/engine/node.types';

///////////////////////////////////////////////////////////////////////////////

export class SchemaEngine {

    _nodeService: NodeService = new NodeService();

    _nodeInstanceService: NodeInstanceService = new NodeInstanceService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    public execute = async (
        schema: SchemaResponseDto,
        schemaInstance: SchemaInstanceResponseDto | null,
        event: EventResponseDto
    ) => {

        // If found,
        //    - Get the correct executing node, active listening nodes, triggered waiting nodes
        // else,
        //    a. Create a new schema instance
        //    b. Set current node as root node
        //    c. Start node execution
        //    d. Initiate the listening nodes - Add this as an action from root node

        var currentNodeInstance: NodeInstanceResponseDto = null;
        if (!schemaInstance) {
            schemaInstance = await this.createSchemaInstance(schema, event);
            currentNodeInstance = schemaInstance.RootNodeInstance as NodeInstanceResponseDto;
        }
        else {
            currentNodeInstance = schemaInstance.CurrentNodeInstance as NodeInstanceResponseDto;
        }
        var currentNode = currentNodeInstance.Node;

        if (currentNodeInstance.ExecutionStatus !== ExecutionStatus.Executed) {
            const executed = await this._executeNodeActions(schema, schemaInstance, currentNode, currentNodeInstance);
            if (executed) {
                currentNodeInstance.ExecutionStatus = ExecutionStatus.Executed;
                await this._nodeInstanceService.update(currentNodeInstance.id, currentNodeInstance);
            }
        }

        var nextNode = await this.traverse(schema, schemaInstance, currentNode, currentNodeInstance, event);

        var nextNodeInstance = await this._nodeInstanceService.create({
            SchemaInstanceId : schemaInstance.id,
            NodeId           : nextNode.id,
            ExecutionStatus  : ExecutionStatus.Pending,
        });
        currentNodeInstance = nextNodeInstance;

        return currentNodeInstance;
    };

    private async createSchemaInstance(schema: SchemaResponseDto, event: EventResponseDto) {

        const padZero = (num: number, size: number) => String(num).padStart(size, '0');
        const pattern = formatDateToYYMMDD(new Date());
        var instanceCount = await this._schemaInstanceService.getCount(schema.TenantId, schema.id, pattern);
        const formattedCount = padZero(instanceCount + 1, 3); // Count with leading zeros (e.g., 001)
        var code = 'E-' + pattern + '-' + formattedCount;

        var schemaInstanceContextParams = schema.ContextParams;
        for (var p of schemaInstanceContextParams.Params) {
            if (p.Type === ParamType.Phonenumber) {
                p.Value = event.UserMessage.Phone;
            }
            if (p.Type === ParamType.Location) {
                p.Value = event.UserMessage.Location;
            }
            if (p.Type === ParamType.Date) {
                p.Value = new Date();
            }
            if (p.Type === ParamType.Text) {
                if (p.Key === 'SchemaInstanceCode') {
                    p.Value = code;
                }
            }
        }
        const schemaInstance = await this._schemaInstanceService.create({
            TenantId      : schema.TenantId,
            Code          : code,
            SchemaId      : schema.id,
            ContextParams : schemaInstanceContextParams,
        });
        return schemaInstance;
    }

    // eslint-disable-next-line max-len
    private async traverse(
        schema: SchemaResponseDto,
        schemaInstance: SchemaInstanceResponseDto,
        currentNode: NodeResponseDto,
        currentNodeInstance: XNodeInstance,
        event: EventResponseDto
    ): Promise<NodeInstance> {

        if (!currentNode) {
            logger.error(`Error while executing workflow. Cannot find the node!`);
        }

        if (currentNode.Type === NodeType.QuestionNode) {
            return await this.traverseQuestionNode(schemaInstance, currentNode);
        }
        else if (currentNode.Type === NodeType.YesNoNode) {
            return await this.traverseYesNoNode(schemaInstance, currentNode);
        }

    }

}
