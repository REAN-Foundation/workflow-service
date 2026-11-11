import 'reflect-metadata';
import { DependencyContainer } from 'tsyringe';
import { FileStorageInjector } from './storage/file.storage.injector';
import { MessagingInjector } from './communication/messaging.injector';
// import { ProcessorsInjector } from './processor/processor.injector';

////////////////////////////////////////////////////////////////////////////////

export class ModuleInjector {

    static registerInjections(container: DependencyContainer) {
        FileStorageInjector.registerInjections(container);
        MessagingInjector.registerInjections(container);
        // ProcessorsInjector.registerInjections(container);
    }

}
