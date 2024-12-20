import express from "express";
import { logger } from "../logger/logger";
import { register as registerUserRoutes } from "../api/user/user.routes";
import { register as registerClientRoutes } from "../api/client/client.routes";
import { register as registerSchemaRoutes } from '../api/engine/schema/schema.routes';
import { register as registerNodeRoutes } from '../api/engine/node/node.routes';
import { register as registerNodeActionRoutes } from '../api/engine/node.action/node.action.routes';
import { register as registerNodePathRoutes } from '../api/engine/node.path/node.path.routes';
import { register as registerRuleRoutes } from '../api/engine/rule/rule.routes';
import { register as registerConditionRoutes } from '../api/engine/condition/condition.routes';
import { register as registerEventRoutes } from '../api/engine/event/event.routes';
import { register as registerSchemaInstanceRoutes } from '../api/engine/schema.instance/schema.instance.routes';
import { register as registerTypesRoutes } from '../api/types/types.routes';
import { register as registerFileResourceRoutes } from '../api/general/file.resource/file.resource.routes';

////////////////////////////////////////////////////////////////////////////////////

export class RouteHandler {

    public static setup = async (expressApp: express.Application): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {

                //Handling the base route
                expressApp.get('/api/v1/', (_request, response) => {
                    response.send({
                        message : `Careplan Service API [Version ${process.env.API_VERSION}]`,
                    });
                });
                expressApp.get('/health-check', (_request, response) => {
                    response.send('ok');
                });

                registerUserRoutes(expressApp);
                registerClientRoutes(expressApp);
                registerSchemaRoutes(expressApp);
                registerNodeRoutes(expressApp);
                registerNodeActionRoutes(expressApp);
                registerNodePathRoutes(expressApp);
                registerRuleRoutes(expressApp);
                registerConditionRoutes(expressApp);
                registerEventRoutes(expressApp);
                registerSchemaInstanceRoutes(expressApp);
                registerTypesRoutes(expressApp);
                registerFileResourceRoutes(expressApp);

                resolve(true);

            } catch (error) {
                logger.error('Error initializing the router: ' + error.message);
                reject(false);
            }
        });
    };

}
