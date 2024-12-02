import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { InputSourceType, OutputDestinationType, ParamType } from "../engine.enums";

export interface Params {
    Name                : string;
    Type                : ParamType;
    Description        ?: string;
    Value               : any | null | undefined;
    Source             ?: InputSourceType;
    Destination        ?: OutputDestinationType;
    Key                ?: string;
    Required           ?: boolean;

    ComparisonThreshold?: number;
    ComparisonUnit     ?: string;
}

export interface ActionParams extends Params {
    ActionType  : string;
}

export interface ActionInputParams {
    Params: ActionParams[];
}

export interface ActionOutputParams {
    Params: ActionParams[];
}

export interface ContextParams {
    Name  : string;
    Params: Params[];
}

export interface DataExtractionInputParams extends ActionInputParams {
    Filters ?: {
        Key  : string;
        Value: string;
    }[];
    RecordDateFrom?: Date;
    RecordDateTo  ?: Date;
}

export interface DataStorageInputParams extends ActionInputParams {
    StorageKeys ?: {
        Key  : string;
        Value: string;
    }[];
}

export interface ActionOutputParams {
    DestinationType : OutputDestinationType;
    Message         : string;
    OutputTag       : string;
    NextNodeId     ?: uuid | undefined;
    Extra?          : any | undefined;
}

export type InputParams = DataExtractionInputParams |
                          DataStorageInputParams |
                          ActionInputParams;

export type OutputParams = ActionOutputParams;
