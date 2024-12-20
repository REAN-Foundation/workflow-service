import "reflect-metadata";
import express from 'express';
import { RouteHandler } from './startup/route.handler';
import { logger } from './logger/logger';
import { Scheduler } from './startup/scheduler';
import { Seeder } from './startup/seeder';
import { DatabaseConnector } from "./database/database.connector";
import { Injector } from "./startup/injector";
import { MiddlewareHandler } from "./startup/middleware.handler";

///////////////////////////////////////////////////////////////////////////////////////////

export default class Application {

    //#region Construction

    public _expressApp: express.Application = null;

    private static _instance: Application = null;

    private constructor() {
        this._expressApp = express();
    }

    public static instance(): Application {
        return this._instance || (this._instance = new this());
    }

    //#endregion

    public expressApp(): express.Application {
        return this._expressApp;
    }

    public start = async(): Promise<void> => {
        try {
            await this.warmUp();
            await this.listen();
        }
        catch (error){
            logger.error('An error occurred while starting reancare-api service.' + error.message);
        }
    };

    warmUp = async () => {
        try {
            await Injector.registerInjections();
            await DatabaseConnector.setup();
            await MiddlewareHandler.setup(this.expressApp());
            await RouteHandler.setup(this.expressApp());
            await Seeder.seed();
            await Scheduler.instance().schedule();
        }
        catch (error) {
            logger.error('An error occurred while warming up.' + error.message);
        }
    };

    private listen = () => {
        return new Promise((resolve, reject) => {
            try {
                const port = process.env.PORT;
                const server = this._expressApp.listen(port, () => {
                    const serviceName = `${process.env.SERVICE_NAME}-[${process.env.NODE_ENV}]`;
                    logger.info(serviceName + ' is up and listening on port ' + process.env.PORT.toString());
                    this._expressApp.emit("server_started");
                });
                module.exports.server = server;
                resolve(this._expressApp);
            }
            catch (error) {
                reject(error);
            }
        });
    };

}
