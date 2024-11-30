import { NodeService } from "../../database/services/engine/node.service";
import { EventResponseDto } from "../../domain.types/engine/event.types";
import { uuid } from "../../domain.types/miscellaneous/system.types";
import { SchemaService } from "../../database/services/engine/schema.service";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";
import { SchemaResponseDto } from "../../domain.types/engine/schema.domain.types";
import { SchemaInstanceResponseDto } from "../../domain.types/engine/schema.instance.types";
import { ParamType } from "../../domain.types/engine/engine.enums";
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
        var schemaContextParams = schema.ContextParams;
        
        var schemaInstance: SchemaInstanceResponseDto = null;
        if (event.SchemaInstanceId) {
            schemaInstance = await this._schemaInstanceService.getById(event.SchemaInstanceId);
        }
        else {
            var schemaInstances = await this._schemaInstanceService.getBySchemaId(schema.id);
            if (schemaInstances.length === 0) {
                var schemaInstanceContextParams = schemaContextParams;
                for (var p of schemaContextParams.Params) {
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
                schemaInstance = await this._schemaInstanceService.create({
                    SchemaId      : schema.id,
                    ContextParams : schemaInstanceContextParams,
                });
            }
            else {
                var selectedInstances: SchemaInstanceResponseDto[] = [];
                for (let index = 0; index < schemaInstances.length; index++) {
                    const si = schemaInstances[index];
                    var match = mathContexts(si.ContextParams, )
                }
            }
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

}

// const facts = [];
// for await (var fact of factNames) {
//     var extractor = this._extractors.find(x => x.Fact === fact);
//     if (extractor) {
//         var extracted = extractor.Extractor.extract(contextReferenceId, fact);
//         facts.push(extracted);
//     }
// }
