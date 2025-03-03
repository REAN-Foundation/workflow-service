import { logger } from "../../logger/logger";
import { EventCreateModel, EventResponseDto } from "../../domain.types/engine/event.types";
import * as asyncLib from 'async';
import { EventType } from '../../domain.types/enums/event.type';
import { SchemaInstanceResponseDto } from "../../domain.types/engine/schema.instance.types";
import { SchemaService } from "../../database/services/engine/schema.service";
import { EventService } from "../../database/services/engine/event.service";
import { SchemaEngine } from "./schema.engine";

////////////////////////////////////////////////////////////////

const ASYNC_TASK_COUNT = 4;

////////////////////////////////////////////////////////////////

export default class ChildSchemaTriggerHandler {

    private static _q = asyncLib.queue((schemaInstance: SchemaInstanceResponseDto, onCompleted) => {
        (async () => {
            await ChildSchemaTriggerHandler.process(schemaInstance);
            onCompleted(schemaInstance);
        })();
    }, ASYNC_TASK_COUNT);

    private static enqueue = (schemaInstance: SchemaInstanceResponseDto) => {
        ChildSchemaTriggerHandler._q.push(schemaInstance, (model, error) => {
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

    static handle = async (schemaInstance: SchemaInstanceResponseDto) => {
        return new Promise((resolve, reject) => {
            try {
                ChildSchemaTriggerHandler.enqueue(schemaInstance);
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        });
    };

    private static process = async (schemaInstance: SchemaInstanceResponseDto) => {

        try {
            // logger.info(JSON.stringify(event, null, 2));
            logger.info(`Processing event: ${schemaInstance.id}`);

            var schemaId = schemaInstance.Schema?.id;
            if (!schemaId) {
                logger.error(`Schema not found: ${schemaId}`);
                return;
            }
            const schemaService: SchemaService = new SchemaService();
            var schema = await schemaService.getById(schemaId);
            if (!schema) {
                logger.error(`Schema not found: ${schemaId}`);
                return;
            }
            const executeImmediately = schema.ExecuteImmediately;
            if (!executeImmediately) {
                logger.info(`Schema not set to execute immediately: ${schemaId}`);
                return;
            }
            logger.info(`Executing schema: ${schema.Name}`);

            const eventCreateModel: EventCreateModel = {
                EventType        : EventType.TriggerChildWorkflow,
                TenantId         : schema.TenantId,
                SchemaId         : schema.id,
                UserMessage      : null,
                SchemaInstanceId : schemaInstance.id,
            };
            const eventService = new EventService();
            const eventRecord: EventResponseDto = await eventService.create(eventCreateModel);
            if (eventRecord === null) {
                logger.error('Unable to add event!');
                return;
            }

            var engine = new SchemaEngine(schema, schemaInstance, eventRecord);
            var currentNodeInstance = await engine.execute();
            logger.info(`Current Node: ${currentNodeInstance.Node.Name}`);

        }
        catch (error) {
            logger.error(`Error: ${error.message}`);
            logger.error(`Error: ${error.stack}`);
        }

    };

    //#endregion

}
