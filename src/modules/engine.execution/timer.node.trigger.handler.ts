import { logger } from "../../logger/logger";
import * as asyncLib from 'async';
import { NodeInstanceResponseDto } from "../../domain.types/engine/node.instance.types";
import { NodeResponseDto } from "../../domain.types/engine/node.types";
import { uuid } from "../../domain.types/miscellaneous/system.types";
import { NodeInstanceService } from "../../database/services/engine/node.instance.service";
import { NodeService } from "../../database/services/engine/node.service";
import { RuleService } from "../../database/services/engine/rule.service";
import { ConditionProcessor } from "./condition.processor";
import { ConditionService } from "../../database/services/engine/condition.service";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { Almanac } from "./almanac";
import { SchemaEngine } from "./schema.engine";
import { EventResponseDto } from "../../domain.types/engine/event.types";
import { SchemaResponseDto } from "../../domain.types/engine/schema.domain.types";
import { SchemaInstanceResponseDto } from "../../domain.types/engine/schema.instance.types";
import { ExecutionStatus } from "../../domain.types/engine/engine.enums";

////////////////////////////////////////////////////////////////

const ASYNC_TASK_COUNT = 4;

////////////////////////////////////////////////////////////////

export interface TimerNodeTriggerModel {
    NodeInstance: NodeInstanceResponseDto;
    Node: NodeResponseDto;
    Event: EventResponseDto;
}

export default class TimerNodeTriggerHandler {

    private static _q = asyncLib.queue((model: TimerNodeTriggerModel, onCompleted) => {
        (async () => {
            await TimerNodeTriggerHandler.process(model);
            onCompleted(model);
        })();
    }, ASYNC_TASK_COUNT);

    private static enqueue = (model: TimerNodeTriggerModel) => {
        TimerNodeTriggerHandler._q.push(model, (x, error) => {
            if (error) {
                logger.error(`Error handling incoming event: ${JSON.stringify(error)}`);
                logger.error(`Error handling incoming event: ${JSON.stringify(error.stack, null, 2)}`);
            }
            else {
                logger.info(`Event received and enqueued`);
                // logger.debug(`Enqueued event: ${JSON.stringify(model, null, 2)}`);
            }
        });
    };

    static handle = async (model: TimerNodeTriggerModel) => {
        return new Promise((resolve, reject) => {
            try {
                TimerNodeTriggerHandler.enqueue(model);
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        });
    };

    private static process = async (model: TimerNodeTriggerModel) => {

        try {

            logger.info(`Processing Timer node trigger: ${model.NodeInstance.id}`);

            var nodeInstance = model.NodeInstance;
            if (!nodeInstance) {
                logger.error(`Timer node instance not found`);
                return;
            }
            var node = model.Node;
            if (!node) {
                logger.error(`Timer node not found`);
                return;
            }
            const numberOfTries = node.NumberOfTries;
            const completedTries = nodeInstance.TimerNumberOfTriesCompleted;
            if (completedTries >= numberOfTries) {
                logger.info(`Timer node tries exhausted: ${nodeInstance.id}`);
                return;
            }

            const timeIntervalMiliSeconds = Math.abs(node.DelaySeconds) * 1000;
            setTimeout(async () => {
                logger.info(`Starting timer: ${node.DelaySeconds} seconds`);
                const now = new Date();
                logger.info(`Current time: ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
                await this.executeTimerNode(nodeInstance.id);
            }, timeIntervalMiliSeconds);

        }
        catch (error) {
            logger.error(`Error: ${error.message}`);
            logger.error(`Error: ${error.stack}`);
        }

    };

    static executeTimerNode = async (nodeInstanceId: uuid) => {
        try {
            const nodeInstanceService = new NodeInstanceService();
            const nodeService = new NodeService();
            const ruleService = new RuleService();
            const conditionService = new ConditionService();
            const schemaService = new SchemaService();
            const schemaInstanceService = new SchemaInstanceService();

            const timerNodeInstance = await nodeInstanceService.getById(nodeInstanceId);
            if (!timerNodeInstance) {
                logger.error(`Timer node execution: Node instance not found: ${nodeInstanceId}`);
                return;
            }
            const nodeId = timerNodeInstance.Node.id;
            const timerNode = await nodeService.getById(nodeId);
            if (!timerNode) {
                logger.error(`Timer node execution: Node not found: ${nodeId}`);
                return;
            }
            const schemaId = timerNode.Schema.id;
            const schema = await schemaService.getById(schemaId);
            if (!schema) {
                logger.error(`Timer node execution: Schema not found: ${schemaId}`);
                return;
            }
            const schemaInstanceId = timerNodeInstance.SchemaInstance.id;
            const schemaInstance = await schemaInstanceService.getById(schemaInstanceId);
            if (!schemaInstance) {
                logger.error(`Timer node execution: Schema instance not found: ${schemaInstanceId}`);
                return;
            }
            var almanac = new Almanac(schemaInstance.id);

            const ruleId = timerNode.RuleId;
            if (!ruleId) {
                logger.error(`Rule not found for Node`);
                return null;
            }
            var rule = await ruleService.getById(ruleId);
            if (!rule) {
                logger.error(`Rule not found for Node`);
                return null;
            }
            var condition = rule.Condition;
            if (!condition) {
                condition = await conditionService.getById(rule.ConditionId);
            }
            var processor = new ConditionProcessor(almanac, null);
            var conditionResult = await processor.processCondition(condition, null);

            //If the condition is not fulfilled, then the timer will be reset
            if (!conditionResult) {

                logger.info(`Condition not met for Timer node: ${timerNode.id}`);

                const totalTries = timerNode.NumberOfTries + 1;
                const completedTries = timerNodeInstance.TimerNumberOfTriesCompleted;
                if (completedTries >= totalTries) {
                    logger.info(`Timer node tries exhausted: ${timerNode.Name}`);
                    logger.info(`Setting next node on timer timeout`);
                    await nodeInstanceService.setExecutionStatus(timerNodeInstance.id, ExecutionStatus.Executed);
                    return await this.setNextNode(
                        schema, schemaInstance, timerNode, timerNode.NextNodeIdOnTimeout);
                }
                await nodeInstanceService.updateTimerTries(timerNodeInstance.id, totalTries);
                const timeIntervalMiliSeconds = Math.abs(timerNode.DelaySeconds) * 1000;
                setTimeout(async () => {
                    await this.executeTimerNode(timerNodeInstance.id);
                }, timeIntervalMiliSeconds);
                return;
            }
            else {
                logger.info(`Condition met for Timer node: ${timerNode.Name}`);
                logger.info(`Setting next node on timer success`);
                await nodeInstanceService.setExecutionStatus(timerNodeInstance.id, ExecutionStatus.Executed);
                return await this.setNextNode(
                    schema, schemaInstance, timerNode, timerNode.NextNodeIdOnSuccess);
            }
        }
        catch (error) {
            logger.error(`Error: ${error.message}`);
            logger.error(`Error: ${error.stack}`);
        }
    };

    static setNextNode = async (
        schema: SchemaResponseDto,
        schemaInstance: SchemaInstanceResponseDto,
        timerNode: NodeResponseDto,
        nextNodeId: uuid
    ) => {
        try {
            const schemaInstanceId: uuid = schemaInstance.id;
            var currentNodeInstanceId = await new SchemaInstanceService().getCurrentNodeInstanceId(schemaInstanceId);
            if (!currentNodeInstanceId) {
                logger.error(`Current node instance not found for Timer node: ${timerNode.id}`);
                return null;
            }
            var currentNodeInstance = await new NodeInstanceService().getById(currentNodeInstanceId);
            if (!currentNodeInstance) {
                logger.error(`Current node instance not found for Timer node: ${timerNode.id}`);
                return null;
            }
            const currentNode = await new NodeService().getById(currentNodeInstance.Node.id);
            if (!currentNode) {
                logger.error(`Current node not found for Timer node: ${timerNode.id}`);
                return null;
            }

            const schemaEngine = new SchemaEngine(schema, schemaInstance, null);
            const result = await schemaEngine.setThisAsNextNodeInstance(
                currentNode,
                currentNodeInstance,
                nextNodeId
            );
            currentNodeInstance = result?.currentNodeInstance;
            if (currentNodeInstance) {
                currentNodeInstance = await schemaEngine.processCurrentNode(currentNodeInstance);
            }
            return currentNodeInstance;
        }
        catch (error) {
            logger.error(`Error: ${error.message}`);
            logger.error(`Error: ${error.stack}`);
            return null;
        }
    };

    //#endregion

}
