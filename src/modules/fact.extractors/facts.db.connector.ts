/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import { Config } from './../../database/database.config';
import { logger } from '../../logger/logger';
import { DataSource } from "typeorm";
import { BadgeFact } from './models/bedge.facts.model';
import { MedicationFact } from './models/medication.fact.model';
import { DBLogger } from "./../../database/database.logger";
import { NutritionChoiceFact } from "./models/nutrition.choice.fact.model";
import { ExercisePhysicalActivityFact } from "./models/exercise.physical.activity.fact.model";
import { VitalFact } from "./models/vital.fact.model";
import { MentalHealthFact } from "./models/mental.health.fact.model";
import FactsDbClient from "./facts.db.client";

///////////////////////////////////////////////////////////////////////////////////
const DATABASE_NAME = `awards_facts`;
///////////////////////////////////////////////////////////////////////////////////

class FactsDatabaseConnector {

    static _source = new DataSource({
        name        : Config.dialect,
        type        : Config.dialect,
        host        : Config.host,
        port        : Config.port,
        username    : Config.username,
        password    : Config.password,
        database    : DATABASE_NAME,
        synchronize : true,
        //entities    : [this._basePath + '/**/**{.model.ts}'],
        entities    : [
            MedicationFact,
            BadgeFact,
            NutritionChoiceFact,
            ExercisePhysicalActivityFact,
            VitalFact,
            MentalHealthFact
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
                .catch(error => {
                    logger.error('Unable to connect to the database:' + error.message);
                    reject(false);
                });
        });
    };

    static setup = async (): Promise<boolean> => {
        try {
            await FactsDbClient.createDatabase();
            await this.initialize();
            return true;
        } catch (error) {
            logger.error('An error occurred while setting up the database connection.' + error.message);
            return false;
        }
    };

}

///////////////////////////////////////////////////////////////////////////////////

const FactsSource = FactsDatabaseConnector._source;

export { FactsDatabaseConnector, FactsSource };
