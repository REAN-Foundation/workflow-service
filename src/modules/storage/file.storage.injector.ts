import 'reflect-metadata';
import { ConfigurationManager } from '../../config/configuration.manager';
import { DependencyContainer } from 'tsyringe';
import { AWSS3FileStorageService } from './providers/aws.s3.file.storage.service';
import { CustomFileStorageService } from './providers/custom.file.storage.service';
import { IFileStorageService } from './interfaces/file.storage.service.interface';

////////////////////////////////////////////////////////////////////////////////

export class FileStorageInjector {

    static registerInjections(container: DependencyContainer) {

        const provider = ConfigurationManager.FileStorageProvider;
        if (provider === 'AWS-S3') {
            container.register<IFileStorageService>('IFileStorageService', { useClass: AWSS3FileStorageService });
        }
        else if (provider === 'Custom') {
            container.register('IFileStorageService', CustomFileStorageService);
        }
    }

}
