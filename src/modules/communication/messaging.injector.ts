import 'reflect-metadata';
import { ConfigurationManager } from '../../config/configuration.manager';
import { DependencyContainer } from 'tsyringe';
import { BotWrapperMessagingProvider } from './providers/bot.wrapper.messaging.provider';
import { MockMessagingProvider } from './providers/mock.messaging.provider';
import { IMessagingProvider } from './interfaces/messaging.provider.interface';

////////////////////////////////////////////////////////////////////////////////

export class MessagingInjector {

    static registerInjections(container: DependencyContainer) {

        const provider = ConfigurationManager.MessagingProvider;
        if (provider === 'Mock') {
            container.register<IMessagingProvider>('IMessagingProvider', { useClass: MockMessagingProvider });
        }
        else {
            container.register<IMessagingProvider>('IMessagingProvider', { useClass: BotWrapperMessagingProvider });
        }
    }

}
