import express from 'express';
import BaseValidator from '../../base.validator';
import { DownloadDisposition } from '../../../domain.types/general/file.resource/file.resource.types';
import { FileResourceMetadata } from '../../../domain.types/general/file.resource/file.resource.types';

///////////////////////////////////////////////////////////////////////////////////////////////

export class FileResourceValidator extends BaseValidator {

    
    getByVersionName = async (request: express.Request): Promise<FileResourceMetadata> => {

        var disposition = this.getDownloadDisposition(request);

        var metadata: FileResourceMetadata = {
            ResourceId  : request.params.id,
            Version     : request.params.version,
            Disposition : disposition
        };

        return metadata;
    };

    public getDownloadDisposition(request) {
        var disposition = DownloadDisposition.Auto;
        if (request.query.disposition) {
            if (request.query.disposition === 'inline') {
                disposition = DownloadDisposition.Inline;
            }
            else if (request.query.disposition === 'stream') {
                disposition = DownloadDisposition.Stream;
            }
            else {
                disposition = DownloadDisposition.Attachment;
            }
        }
        return disposition;
    }

}
