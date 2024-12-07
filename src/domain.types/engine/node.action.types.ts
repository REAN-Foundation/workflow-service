import { BaseSearchFilters, BaseSearchResults } from "../miscellaneous/base.search.types";
import { uuid } from "../miscellaneous/system.types";
import { ActionType } from "./engine.enums";
import { ActionInputParams, ActionOutputParams } from "./intermediate.types";

////////////////////////////////////////////////////////////////////////

export interface NodeActionCreateModel {
    Type        : ActionType;
    ParentNodeId: uuid;
    Name        : string;
    Description?: string;
    Input       : ActionInputParams;
    Output      : ActionOutputParams;
}

export interface NodeActionUpdateModel {
    Type        ?: ActionType;
    ParentNodeId?: uuid;
    Name        ?: string;
    Description ?: string;
    Input       ?: ActionInputParams;
    Output      ?: ActionOutputParams;
}

export interface NodeActionResponseDto {
    id         : uuid;
    Type       : ActionType;
    Name       : string;
    Description: string;
    ParentNode : {
        id: uuid;
        Name: string;
        Description: string;
    }
    Input      : ActionInputParams;
    Output     : ActionOutputParams;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface NodeActionSearchFilters extends BaseSearchFilters {
    Name         ?: string;
    ParentNodeId ?: uuid;
    Type         ?: ActionType;
}

export interface NodeActionSearchResults extends BaseSearchResults {
    Items: NodeActionResponseDto[];
}
