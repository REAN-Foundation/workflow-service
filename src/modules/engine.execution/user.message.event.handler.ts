import { EventResponseDto } from "../../domain.types/engine/event.types";
import { uuid } from "../../domain.types/miscellaneous/system.types";
// import { IExtractor } from "../fact.extractors/extractor.interface";

///////////////////////////////////////////////////////////////////////////

export default class UserMessageEventHandler {

    // _extractors: { Fact: string; Extractor: IExtractor }[] = [];

    public handle = async (event: EventResponseDto): Promise<boolean> => {
        // const facts = [];
        // for await (var fact of factNames) {
        //     var extractor = this._extractors.find(x => x.Fact === fact);
        //     if (extractor) {
        //         var extracted = extractor.Extractor.extract(contextReferenceId, fact);
        //         facts.push(extracted);
        //     }
        // }
        return true;
    };

}
