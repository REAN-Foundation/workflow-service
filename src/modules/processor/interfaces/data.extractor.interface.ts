import { DataExtractionInputParams } from '../../../domain.types/engine/params.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { ProcessorResult } from '../../../domain.types/engine/common.types';
import { OutputParams } from '../../../domain.types/engine/params.types';

////////////////////////////////////////////////////////////////

export interface IDataExtractor {

    extractData(
        contextId: uuid,
        inputParams: DataExtractionInputParams,
        outputParams: OutputParams): Promise<ProcessorResult>;

}
