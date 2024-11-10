import express from 'express';
import { FileResourceController } from './file.resource.controller';
import { AuthHandler as Auth } from '../../../auth/auth.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new FileResourceController();
    const contextBase = 'FileResource';

    router.post('/upload', Auth.handle(`${contextBase}.Create`, false, true, true), controller.upload);
    router.get('/download/:id', Auth.handle(`${contextBase}.Download`, false, false, false), controller.download);
    router.get('/:id', Auth.handle(`${contextBase}.GetById`, false, true, true), controller.getById);
    router.delete('/:id', Auth.handle(`${contextBase}.Delete`, false, true, true), controller.delete);

    router.get('/:id/download-by-version-name/:version', Auth.handle(`${contextBase}.DownloadByVersion`, false, false, false), controller.downloadByVersion);

    app.use('/api/v1/file-resources', router);
};
