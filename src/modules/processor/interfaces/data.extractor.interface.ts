import { DataExtractionInputParams } from '../../../domain.types/engine/intermediate.types/params.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { ProcessorResult } from '../../../domain.types/engine/intermediate.types/common.types';
import { OutputParams } from '../../../domain.types/engine/intermediate.types/params.types';

////////////////////////////////////////////////////////////////

export interface IDataExtractor {

    extractData(
        contextId: uuid,
        inputParams: DataExtractionInputParams,
        outputParams: OutputParams): Promise<ProcessorResult>;

}
