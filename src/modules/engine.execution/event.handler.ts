import { logger } from "../../logger/logger";
import { EventResponseDto } from "../../domain.types/engine/event.types";
import * as asyncLib from 'async';
import { EventType } from "../../domain.types/enums/event.type";
import { UserMessageEventHandler } from './user.message.event.handler';

// import { ContextService } from "../../database/services/engine/context.service";
// import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
// import { SchemaEngine } from "./schema.engine";
// import { SchemaService } from "../../database/services/engine/schema.service";
// import { SchemaInstanceResponseDto, SchemaInstanceSearchFilters } from "../../domain.types/engine/schema.instance.types";

//////////////////////////////////////////////////////////////////////////////

const ASYNC_TASK_COUNT = 4;

export default class EventHandler {

    private static _q = asyncLib.queue((event: EventResponseDto, onCompleted) => {
        (async () => {
            await EventHandler.processEvent(event);
            onCompleted(event);
        })();
    }, ASYNC_TASK_COUNT);

    private static enqueue = (model: EventResponseDto) => {
        EventHandler._q.push(model, (model, error) => {
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

    static handle = async (event: EventResponseDto) => {
        return new Promise((resolve, reject) => {
            try {
                EventHandler.enqueue(event);
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        });
    };

    private static processEvent = async (event: EventResponseDto) => {

        try {
            // logger.info(JSON.stringify(event, null, 2));
            logger.info(`Processing event: ${event.EventType}`);

            if (event.EventType === EventType.UserMessage) {
                var handler = new UserMessageEventHandler();
                await handler.handle(event);
            }
            else {
                logger.info('Terminating workflow!');
            }
            //Process incoming event here...

            // const contextService = new ContextService();
            // const schemaInstanceService = new SchemaInstanceService();
            // const schemaService = new SchemaService();
            // const referenceId = event.ReferenceId;

            // const eventType = event.EventType;
            // const schemaForEventType = await schemaService.getByEventType(eventType.id);
            // const filtered: SchemaInstanceResponseDto[] = [];
            // for await (var s of schemaForEventType) {
            //     const schemaId = s.id;
            //     const filters: SchemaInstanceSearchFilters = {
            //         ContextId : context.id,
            //         SchemaId  : schemaId
            //     };
            //     const searchResults = await schemaInstanceService.search(filters);
            //     const schemaInstances = searchResults.Items;
            //     if (schemaInstances.length === 0) {
            //         const schemaInstance = await schemaInstanceService.create({
            //             SchemaId  : schemaId,
            //             ContextId : context.id
            //         });
            //         if (schemaInstance) {
            //             logger.info(`Schema instance created successfully!`);
            //         }
            //         filtered.push(schemaInstance);
            //     }
            //     else {
            //         filtered.push(...schemaInstances);
            //     }
            // }

            // for await (var instance of filtered) {
            //     await SchemaEngine.execute(instance);
            // }
        }
        catch (error) {
            logger.error(`Error: ${error.message}`);
            logger.error(`Error: ${error.stack}`);
        }

    };

}
