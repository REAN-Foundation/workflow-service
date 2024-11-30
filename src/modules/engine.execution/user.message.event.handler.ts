import { NodeService } from "../../database/services/engine/node.service";
import { EventResponseDto } from "../../domain.types/engine/event.types";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { SchemaResponseDto } from "../../domain.types/engine/schema.domain.types";
import { SchemaInstanceResponseDto } from "../../domain.types/engine/schema.instance.types";
import { ParamType } from "../../domain.types/engine/engine.enums";
import { ContextParams, Params, TimestampUnit, DistanceUnit } from "../../domain.types/engine/intermediate.types";
import { compareLocations, compareTimestamps } from "../../domain.types/engine/value.comparator";

// import { IExtractor } from "../fact.extractors/extractor.interface";

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
            var schemas = await this._schemaService.getByTenantId(tenantId);
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
        var schemas = await this._schemaService.getByTenantId(tenantId);
        if (schemas.length === 0) {
            return false;
        }
        var schema = schemas[0];

        // 2. Identify the schema instance - By context params comparison

        var schemaInstance: SchemaInstanceResponseDto = null;
        if (event.SchemaInstanceId) {
            schemaInstance = await this._schemaInstanceService.getById(event.SchemaInstanceId);
        }
        else {
            var schemaInstances = await this._schemaInstanceService.getBySchemaId(schema.id);
            if (schemaInstances.length === 0) {
                schemaInstance = await this.createSchemaInstance(schema, event);
            }
            else {
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
                    else {
                        schemaInstance = await this.createSchemaInstance(schema, event);
                    }
                }
            }
        }

        if (!schemaInstance) {
            return false;
        }

        // If found,
        //    - Get the correct executing node, active listening nodes, triggered waiting nodes
        // else,
        //    a. Create a new schema instance
        //    b. Set current node as root node
        //    c. Start node execution
        //    d. Initiate the listening nodes - Add this as an action from root node

        return true;
    };

    private async createSchemaInstance(schema: SchemaResponseDto, event: EventResponseDto, ) {
        var schemaInstanceContextParams = schema.ContextParams;
        for (var p of schemaInstanceContextParams.Params) {
            if (p.Type === ParamType.Phonenumber) {
                p.Value = event.UserMessage.Phone;
            }
            if (p.Type === ParamType.Location) {
                p.Value = event.UserMessage.Location;
            }
            if (p.Type === ParamType.Date) {
                p.Value = new Date();
            }
        }
        const schemaInstance = await this._schemaInstanceService.create({
            SchemaId      : schema.id,
            ContextParams : schemaInstanceContextParams,
        });
        return schemaInstance;
    }

    private checkSchemaInstanceCodeMatch(schemaInstance: SchemaInstanceResponseDto, event: EventResponseDto): boolean {
        if (schemaInstance.ContextParams.Params.length === 0) {
            return false;
        }
        var p = schemaInstance.ContextParams.Params.find(x => x.Type === ParamType.Text && x.Key === 'SchemaInstanceCode');
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
            if (p.Type === ParamType.Phonenumber) {
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
                if (!compareLocations(p.Value, event.UserMessage.Location, p.ComparisonThreshold, distUnit)) {
                    if (p.Required) {
                        return [];
                    }
                }
                else {
                    matchingParams.push(p);
                }
            }
            if (p.Type === ParamType.Date) {
                var timeUnit = p.ComparisonUnit as TimestampUnit ?? 'm';
                if (!compareTimestamps(p.Value, new Date(), p.ComparisonThreshold, timeUnit)) {
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

// const facts = [];
// for await (var fact of factNames) {
//     var extractor = this._extractors.find(x => x.Fact === fact);
//     if (extractor) {
//         var extracted = extractor.Extractor.extract(contextReferenceId, fact);
//         facts.push(extracted);
//     }
// }
