import pino from 'pino';
import { AbstrctPinoLogger } from './abstract.pino.logger';

//Please refer for further customization:
// https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/

///////////////////////////////////////////////////////////////////////

export class PinoDebugLogger extends AbstrctPinoLogger {

    constructor() {
        super();

        this._logger = pino({
            level: 'debug',
            transport: {
                target: 'pino-pretty',
                //target : this._logFile
            },
            formatters: {
                level: (label) => {
                    return { level: label };
                },
            },
            timestamp: pino.stdTimeFunctions.isoTime,
            serializers: {
                req: pino.stdSerializers.req,
                res: pino.stdSerializers.res,
                err: pino.stdSerializers.err,
            },
            safe: true,
            customLevels: {
                log: 35,
            },
            name: 'workflow-service',
        });
    }

    info = (str: string) => {
        this._logger?.info(str);
    };

    error = (str: string) => {
        this._logger?.error(str);
    };

    warn = (str: string) => {
        this._logger?.warn(str);
    };

    debug = (str: string) => {
        this._logger?.debug(str);
    };

}
