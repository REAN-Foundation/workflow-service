import { ExecutionStatus, NodeType } from '../../domain.types/engine/engine.enums';
import { NodeService } from "../../database/services/engine/node.service";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { NodeInstanceResponseDto } from '../../domain.types/engine/node.instance.types';
import { logger } from '../../logger/logger';
import { NodeInstanceService } from '../../database/services/engine/node.instance.service';
import { NodeResponseDto } from '../../domain.types/engine/node.types';
import { CommonUtilsService } from '../../database/services/engine/common.utils.service';
import { RuleService } from '../../database/services/engine/rule.service';
import { NodeActionService } from '../../database/services/engine/node.action.service';
import { uuid } from '../../domain.types/miscellaneous/system.types';

///////////////////////////////////////////////////////////////////////////////

export class EngineUtils {

    _nodeService: NodeService = new NodeService();

    _ruleService: RuleService = new RuleService();

    _nodeInstanceService: NodeInstanceService = new NodeInstanceService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    _actionService: NodeActionService = new NodeActionService();

    _commonUtilsService: CommonUtilsService = new CommonUtilsService();

    public createNodeInstance = async (nodeId: uuid, schemaInstanceId: uuid)
        : Promise<[NodeInstanceResponseDto, NodeResponseDto]> => {
        try {
            if (!nodeId) {
                logger.error('Node Id is required');
                return null;
            }
            if (!schemaInstanceId) {
                logger.error('Schema Instance Id is required');
                return null;
            }
            var node = await this._nodeService.getById(nodeId);
            if (!node) {
                logger.error(`Node not found for Id: ${nodeId}`);
                return null;
            }
            var nodeInstance = await this._nodeInstanceService.getByNodeIdAndSchemaInstance(nodeId, schemaInstanceId);
            if (!nodeInstance) {
                nodeInstance = await this._nodeInstanceService.create({
                    Type             : node.Type,
                    Input            : node.Input,
                    NodeId           : node.id,
                    SchemaInstanceId : schemaInstanceId,
                    ExecutionStatus  : ExecutionStatus.Pending,
                });
            }
            if (!nodeInstance) {
                logger.error(`Unable to create node instance for Node Id: ${nodeId}`);
                return null;
            }

            const actionIntances = await this._commonUtilsService.getOrCreateNodeActionInstances(nodeInstance.id);
            nodeInstance.ActionInstances = actionIntances;

            if (node.Type === NodeType.YesNoNode) {
                const yesAction = await this._actionService.getById(node.YesAction.id);
                const noAction = await this._actionService.getById(node.NoAction.id);
                if (!yesAction || !noAction) {
                    logger.error(`Yes/No actions not found for Node ${node.Name}`);
                    return null;
                }
                await this._commonUtilsService.getOrCreateNodeActionInstance(yesAction.id, schemaInstanceId);
                await this._commonUtilsService.getOrCreateNodeActionInstance(noAction.id, schemaInstanceId);
            }
            return [nodeInstance, node];
        } catch (error) {
            logger.error(error.message);
            return null;
        }
    };

}
