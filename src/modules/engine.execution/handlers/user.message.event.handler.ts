import { NodeService } from "../../../database/services/engine/node.service";
import { EventResponseDto } from "../../../domain.types/engine/event.types";
import { SchemaService } from "../../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../../database/services/engine/schema.instance.service";
import { SchemaResponseDto } from "../../../domain.types/engine/schema.domain.types";
import { SchemaInstanceResponseDto } from "../../../domain.types/engine/schema.instance.types";
import { ParamType } from "../../../domain.types/engine/engine.enums";
import { SchemaEngine } from "./../schema.engine";
import { logger } from "../../../logger/logger";
import { ContextParams, Params } from "../../../domain.types/engine/params.types";
import { DistanceUnit } from "../../../domain.types/engine/common.types";
import { MiscUtils } from "../../../common/utilities/misc.utils";
import { TimeUtils } from "../../../common/utilities/time.utils";

///////////////////////////////////////////////////////////////////////////

export class UserMessageEventHandler {

    _nodeService: NodeService = new NodeService();

    _schemaService: SchemaService = new SchemaService();

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    public handle = async (event: EventResponseDto): Promise<boolean> => {

        // 1. Identify the schema using tenantId - Assume that there is only one schema or by code/name

        var tenantId = event.TenantId;
        var schema: SchemaResponseDto = null;
        if (!event.SchemaId) {
            // If schema Id is not specified, then get the first top-level schema for the tenant
            var schemas = await this._schemaService.getParentSchemasByTenantId(tenantId);
            if (schemas.length === 0) {
                return false;
            }
            schema = schemas[0];
        }
        else {
            schema = await this._schemaService.getById(event.SchemaId);
            if (!schema) {
                return false;
            }
        }

        // 2. Identify the schema instance - By context params comparison

        var schemaInstance: SchemaInstanceResponseDto = null;
        if (event.SchemaInstanceId) {
            schemaInstance = await this._schemaInstanceService.getById(event.SchemaInstanceId);
            if (!schemaInstance || schemaInstance.Terminated) {
                logger.error(`Schema Instance not found or terminated: ${event.SchemaInstanceId}`);
                return false;
            }
        }
        else {
            var schemaInstances = await this._schemaInstanceService.getBySchemaId(schema.id);

            //Filter out those that are terminated
            schemaInstances = schemaInstances.filter(x => !x.Terminated);

            if (schemaInstances.length > 0) {
                var matchedSchema = schemaInstances.find(x => this.checkSchemaInstanceCodeMatch(x, event));
                if (matchedSchema) {
                    schemaInstance = matchedSchema;
                }
                else {
                    var selectedInstance = null;
                    var matchCount = 0;
                    for (let index = 0; index < schemaInstances.length; index++) {
                        const si = schemaInstances[index];
                        var matches = this.matchContexts(si.ContextParams, event);
                        if (matches.length > matchCount) {
                            selectedInstance = si;
                            matchCount = matches.length;
                        }
                    }
                    if (selectedInstance) {
                        schemaInstance = selectedInstance;
                    }
                }
            }
        }

        // 3. Start the schema instance execution

        var engine = new SchemaEngine(schema, schemaInstance, event);
        var currentNodeInstance = await engine.execute();
        logger.info(`User message event handler: Current Node: ${currentNodeInstance.Node.Name}`);

        return true;
    };

    private checkSchemaInstanceCodeMatch(
        schemaInstance: SchemaInstanceResponseDto, event: EventResponseDto): boolean {
        if (schemaInstance.ContextParams.Params.length === 0) {
            return false;
        }
        var p = schemaInstance.ContextParams.Params.find(
            x => x.Type === ParamType.Text && x.Key === 'SchemaInstanceCode');
        if (!p) {
            return false;
        }
        if (event.SchemaInstanceCode &&
            event.SchemaInstanceCode.length > 0 &&
            p.Value === event.SchemaInstanceCode) {
            return true;
        }
        return false;
    }

    private matchContexts(schemaContextParams: ContextParams, event: EventResponseDto): Params[] {
        var matchingParams: Params[] = [];
        for (var p of schemaContextParams.Params) {
            if (p.Type === ParamType.Phone) {
                if (p.Value !== event.UserMessage.Phone) {
                    if (p.Required) {
                        return [];
                    }
                }
                else {
                    matchingParams.push(p);
                }
            }
            if (p.Type === ParamType.Location) {
                var distUnit = p.ComparisonUnit as DistanceUnit ?? 'm';
                if (!event.UserMessage.Location || !p.Value) {
                    continue;
                }
                if (!MiscUtils.compareLocations(p.Value, event.UserMessage.Location, p.ComparisonThreshold, distUnit)) {
                    if (p.Required) {
                        return [];
                    }
                }
                else {
                    matchingParams.push(p);
                }
            }
            if (p.Type === ParamType.DateTime) {
                // var timeUnit = p.ComparisonUnit as TimestampUnit ?? 'm';
                if (!TimeUtils.compareTimestamps(p.Value, new Date(), p.ComparisonThreshold)) {
                    if (p.Required) {
                        return [];
                    }
                }
                else {
                    matchingParams.push(p);
                }
            }
            if (p.Type === ParamType.Text && p.Key === 'SchemaInstanceCode') {
                if (event.SchemaInstanceCode &&
                    event.SchemaInstanceCode.length > 0 &&
                    p.Value !== event.SchemaInstanceCode) {
                    return [];
                }
                matchingParams.push(p);
            }
        }
        return matchingParams;
    }

}
