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

////////////////////////////////////////////////////////////////

const ASYNC_TASK_COUNT = 4;

////////////////////////////////////////////////////////////////

export interface TimerNodeTriggerModel {
    NodeInstance: NodeInstanceResponseDto;
    Node: NodeResponseDto;
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

            const timeIntervalMiliSeconds = Math.abs(node.TimerSeconds) * 1000;
            setTimeout(async () => {
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

            const nodeInstance = await nodeInstanceService.getById(nodeInstanceId);
            if (!nodeInstance) {
                logger.error(`Timer node execution: Node instance not found: ${nodeInstanceId}`);
                return;
            }
            const nodeId = nodeInstance.Node.id;
            const node = await nodeService.getById(nodeId);
            if (!node) {
                logger.error(`Timer node execution: Node not found: ${nodeId}`);
                return;
            }
            const schemaId = node.Schema.id;
            const schema = await schemaService.getById(schemaId);
            if (!schema) {
                logger.error(`Timer node execution: Schema not found: ${schemaId}`);
                return;
            }
            const schemaInstanceId = nodeInstance.SchemaInstance.id;
            const schemaInstance = await schemaInstanceService.getById(schemaInstanceId);
            if (!schemaInstance) {
                logger.error(`Timer node execution: Schema instance not found: ${schemaInstanceId}`);
                return;
            }
            var almanac = new Almanac(schemaInstance.id);

            const ruleId = node.RuleId;
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

                logger.info(`Condition not met for Timer node: ${node.id}`);

                const totalTries = node.NumberOfTries;
                const completedTries = nodeInstance.TimerNumberOfTriesCompleted;
                if (completedTries >= totalTries) {
                    logger.info(`Timer node tries exhausted: ${nodeInstance.id}`);
                    return;
                }
                const tries = completedTries + 1;
                await nodeInstanceService.updateTimerTries(nodeInstance.id, tries);

                const timeIntervalMiliSeconds = Math.abs(node.TimerSeconds) * 1000;
                setTimeout(async () => {
                    await this.executeTimerNode(nodeInstance.id);
                }, timeIntervalMiliSeconds);

                return;
            }

            const engine = new SchemaEngine(
                schema,
                schemaInstance,
                null
            );
            await engine.executeNodeActions(nodeInstance);
        }
        catch (error) {
            logger.error(`Error: ${error.message}`);
            logger.error(`Error: ${error.stack}`);
        }
    };

    //#endregion

}
