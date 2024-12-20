import { BaseSearchFilters, BaseSearchResults } from "../miscellaneous/base.search.types";
import { uuid } from "../miscellaneous/system.types";
import { ActionType } from "./engine.enums";
import { ActionInputParams, ActionOutputParams } from "./params.types";

////////////////////////////////////////////////////////////////////////

export interface NodeActionCreateModel {
    Type         : ActionType;
    Sequence     : number;
    IsPathAction?: boolean;
    ParentNodeId : uuid;
    Name         : string;
    Description ?: string;
    Input        : ActionInputParams;
    Output      ?: ActionOutputParams;
}

export interface NodeActionUpdateModel {
    Type        ?: ActionType;
    Sequence    ?: number;
    ParentNodeId?: uuid;
    IsPathAction?: boolean;
    Name        ?: string;
    Description ?: string;
    Input       ?: ActionInputParams;
    Output      ?: ActionOutputParams;
}

export interface NodeActionResponseDto {
    id          : uuid;
    Type        : ActionType;
    Sequence    : number;
    IsPathAction: boolean;
    Name        : string;
    Description : string;
    ParentNode  : {
        id         : uuid;
        Name       : string;
        Description: string;
    }
    Input    : ActionInputParams;
    Output   : ActionOutputParams;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface NodeActionSearchFilters extends BaseSearchFilters {
    Name         ?: string;
    ParentNodeId ?: uuid;
    Type         ?: ActionType;
    IsPathAction ?: boolean;
}

export interface NodeActionSearchResults extends BaseSearchResults {
    Items: NodeActionResponseDto[];
}

export interface NodeActionResult {
    Success: boolean;
    Result : any;
}
