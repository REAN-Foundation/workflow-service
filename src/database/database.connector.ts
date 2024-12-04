/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import { Config } from './database.config';
import { logger } from '../logger/logger';
import { DataSource } from "typeorm";
import path from "path";
import { Client } from './models/client/client.model';
import { User } from './models/user/user.model';
import { Condition } from './models/engine/condition.model';
import { Node } from './models/engine/node.model';
import { NodeInstance } from './models/engine/node.instance.model';
import { NodeAction } from './models/engine/node.action.model';
import { Rule } from './models/engine/rule.model';
import { SchemaInstance } from './models/engine/schema.instance.model';
import { Schema } from './models/engine/schema.model';
import { FileResource } from "./models/general/file.resource.model";
import { Person } from './models/user/person.model';
import { UserLoginSession } from "./models/user/user.login.session.model";
import { Role } from "./models/user/role.model";
import { Privilege } from "./models/user/privilege.model";
import { DBLogger } from "./database.logger";
import { FileResourceVersion } from "./models/general/file.resource.version.model";
import { DbClient } from "./db.clients/db.client";
import { NodePath } from "./models/engine/node.path.model";
import { NodeActionInstance } from "./models/engine/node.action.instance.model";
import { Question } from "./models/engine/question.model";
import { QuestionOption } from "./models/engine/question.option.model";
import { Event } from "./models/engine/event.model";

///////////////////////////////////////////////////////////////////////////////////

logger.info(`environment : ${process.env.NODE_ENV}`);
logger.info(`db name     : ${Config.database}`);
logger.info(`db username : ${Config.username}`);
logger.info(`db host     : ${Config.host}`);

///////////////////////////////////////////////////////////////////////////////////

class DatabaseConnector {

    static _basePath = path.join(process.cwd(), 'src/database/models').replace(/\\/g, '/');

    static _source = new DataSource({
        name        : Config.dialect,
        type        : Config.dialect,
        host        : Config.host,
        port        : Config.port,
        username    : Config.username,
        password    : Config.password,
        database    : Config.database,
        synchronize : true,
        //entities    : [this._basePath + '/**/**{.model.ts}'],
        entities    : [
            Client,
            Condition,
            Event,
            NodeAction,
            NodeInstance,
            NodePath,
            NodeAction,
            NodeActionInstance,
            Node,
            Rule,
            Schema,
            SchemaInstance,
            Event,
            FileResource,
            Person,
            User,
            UserLoginSession,
            Role,
            Privilege,
            FileResourceVersion,
            Question,
            QuestionOption,
        ],
        migrations  : [],
        subscribers : [],
        //logger      : 'advanced-console', //Use console for the typeorm logging
        logger      : new DBLogger(),
        logging     : true,
        poolSize    : Config.pool.max,
        cache       : true,
    });

    private static initialize = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._source
                .initialize()
                .then(() => {
                    logger.info('Database connection has been established successfully.');
                    resolve(true);
                })
                .catch((error) => {
                    logger.error('Unable to connect to the database:' + error.message);
                    reject(false);
                });
        });
    };

    static setup = async (): Promise<boolean> => {
        if (process.env.NODE_ENV === 'test') {
            //Note: This is only for test environment
            //Drop all tables in db
            await DbClient.dropDatabase();
        }
        await DbClient.createDatabase();
        await DatabaseConnector.initialize();
        return true;
    };

    static close = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._source
                .destroy()
                .then(() => {
                    logger.info('Database connection has been closed successfully.');
                    resolve(true);
                })
                .catch((error) => {
                    logger.error('Unable to close the database connection:' + error.message);
                    reject(false);
                });
        });
    };

}

///////////////////////////////////////////////////////////////////////////////////

// function getFoldersRecursively(location: string) {
//     const items = fs.readdirSync(location, { withFileTypes: true });
//     let paths = [];
//     for (const item of items) {
//         if (item.isDirectory()) {
//             const fullPath = path.join(location, item.name);
//             const childrenPaths = this.getFoldersRecursively(fullPath);
//             paths = [
//                 ...paths,
//                 fullPath,
//                 ...childrenPaths,
//             ];
//         }
//     }
//     return paths;
// }
//Usage
// static _folders = this.getFoldersRecursively(this._basePath)
//     .map(y => y.replace(/\\/g, '/'))
//     .map(x => '"' + x + '/*.js"');

///////////////////////////////////////////////////////////////////////////////////

const Source = DatabaseConnector._source;

export { DatabaseConnector, Source };
