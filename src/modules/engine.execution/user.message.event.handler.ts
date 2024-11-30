import { EventResponseDto } from "../../domain.types/engine/event.types";
import { uuid } from "../../domain.types/miscellaneous/system.types";
// import { IExtractor } from "../fact.extractors/extractor.interface";

///////////////////////////////////////////////////////////////////////////

export default class UserMessageEventHandler {

    // _extractors: { Fact: string; Extractor: IExtractor }[] = [];

    public handle = async (event: EventResponseDto): Promise<boolean> => {

        // 1. Identify the schema using tenantId - Asum that there is only one schema or by code/name
        // 2. Identify the schema instance - By context params comparison
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
