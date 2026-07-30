import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { logger } from '../../../logger/logger';
import { WorkflowEvent } from '../../../domain.types/engine/event.types';
import { IMessagingProvider } from '../interfaces/messaging.provider.interface';
import { MessageCaptureStore } from '../message.capture.store';

///////////////////////////////////////////////////////////////////////////////////

@injectable()
export class MockMessagingProvider implements IMessagingProvider {

    send = async (tenantCode: string, toPhone: string, message: WorkflowEvent): Promise<boolean> => {
        const userMessage = message?.UserMessage;

        MessageCaptureStore.add({
            CapturedAt       : new Date(),
            TenantCode       : tenantCode,
            ToPhone          : toPhone,
            SchemaId         : message?.SchemaId,
            SchemaInstanceId : message?.SchemaInstanceId,
            EventType        : message?.EventType,
            MessageType      : userMessage?.MessageType,
            MessageChannel   : userMessage?.MessageChannel,
            TextMessage      : userMessage?.TextMessage,
            QuestionText     : userMessage?.QuestionText,
            QuestionOptions  : userMessage?.QuestionOptions,
            Location         : userMessage?.Location,
            RawEvent         : message,
        });

        logger.info(
            `[MockMessagingProvider] Captured outbound message ` +
            `| phone: ${toPhone} | channel: ${userMessage?.MessageChannel} ` +
            `| type: ${userMessage?.MessageType} | text: ${userMessage?.TextMessage ?? ''} ` +
            `| question: ${userMessage?.QuestionText ?? ''}`
        );

        return true;
    };

}
