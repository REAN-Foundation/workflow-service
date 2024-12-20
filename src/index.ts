import dotenv from 'dotenv';
dotenv.config();
import { Telemetry } from './telemetry/instrumenter'; //!This should be imported before Application
import Application from './app';
import { logger } from './logger/logger';

/////////////////////////////////////////////////////////////////////////

(async () => {
    Telemetry.instance().details();
    const app = Application.instance();
    await app.start();
})();

/////////////////////////////////////////////////////////////////////////

//Shutting down the service gracefully

const TERMINATION_SIGNALS = [
    `exit`,
    `SIGINT`,
    `SIGUSR1`,
    `SIGUSR2`,
    `uncaughtException`,
    `SIGTERM`
];

TERMINATION_SIGNALS.forEach((terminationEvent) => {
    process.on(terminationEvent, (data) => {
        Telemetry.instance().shutdown();
        logger.info(`Received ${terminationEvent} signal`);
        logger.error(JSON.stringify(data, null, 2));
        process.exit(0);
    });
});

/////////////////////////////////////////////////////////////////////////
