import pino from 'pino';
import { AbstrctPinoLogger } from './abstract.pino.logger';

///////////////////////////////////////////////////////////////////////

export class PinoProdLogger extends AbstrctPinoLogger {

    constructor() {
        super();

        this._logger = pino({
            level: 'error',
            transport : {
                target : 'pino-pretty',
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
