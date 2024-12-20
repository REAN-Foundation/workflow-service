import { DataStorageInputParams } from '../../../domain.types/engine/intermediate.types/params.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { OutputParams } from '../../../domain.types/engine/intermediate.types/params.types';
import { ProcessorResult } from '../../../domain.types/engine/common.types';

////////////////////////////////////////////////////////////////

export interface IDataStore {

    storeData(
        contextId: uuid,
        records:any[],
        inputParams: DataStorageInputParams,
        outputParams: OutputParams): Promise<ProcessorResult>;

    removeData(
        contextId: uuid,
        records:any[],
        inputParams: DataStorageInputParams,
        outputParams: OutputParams): Promise<ProcessorResult>;

}
