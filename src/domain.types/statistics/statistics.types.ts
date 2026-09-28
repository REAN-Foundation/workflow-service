import { integer, uuid } from "../miscellaneous/system.types";
import { ParamType, SchemaType } from "../engine/engine.enums";
import { BaseSearchResults } from "../miscellaneous/base.search.types";

///////////////////////////////////////////////////////////////////////////////

export type WorkflowInstanceStatus = 'Running' | 'Completed';

export interface StatisticsBaseFilters {
    TenantId         : uuid;
    CreatedDateFrom? : Date;
    CreatedDateTo?   : Date;
}

export interface DateRangeDto {
    From : Date | null;
    To   : Date | null;
}

///////////////////////////////////////////////////////////////////////////////

export interface WorkflowInstanceStatusCount {
    Status : WorkflowInstanceStatus;
    Count  : number;
}

export interface WorkflowInstanceStatsResponseDto {
    TenantId        : uuid;
    DateRange       : DateRangeDto;
    TotalCount      : number;
    CompletedInstances : number;
    RunningInstances   : number;
}

///////////////////////////////////////////////////////////////////////////////

export interface WorkflowDefinitionStatsFilters extends StatisticsBaseFilters {
    SchemaId? : uuid;
}

export interface WorkflowDefinitionStatItem {
    SchemaId           : uuid;
    SchemaName         : string;
    SchemaType         : SchemaType;
    TotalInstances     : number;
    RunningInstances    : number;
    CompletedInstances  : number;
    CompletionRate      : number;
}

export interface WorkflowDefinitionStatsResponseDto {
    TenantId     : uuid;
    DateRange    : DateRangeDto;
    TotalSchemas : number;
    Items        : WorkflowDefinitionStatItem[];
}

///////////////////////////////////////////////////////////////////////////////

export interface DailySchemaInstanceTrendFilters extends StatisticsBaseFilters {
    SchemaId? : uuid; // optional — omit to get every schema for the tenant
}

export interface DailySchemaTrendPoint {
    Date       : string;
    SchemaId   : uuid;
    SchemaName : string;
    Triggered  : number;
    Completed  : number;
}

export interface DailySchemaInstanceTrendResponseDto {
    TenantId  : uuid;
    DateRange : DateRangeDto;
    Points    : DailySchemaTrendPoint[];
}

///////////////////////////////////////////////////////////////////////////////

export interface AlmanacEntry {
    Key   : string;
    Value : any;
}

export interface SchemaInstanceListFilters extends StatisticsBaseFilters {
    SchemaId?     : uuid;
    PageIndex?    : integer;
    ItemsPerPage? : integer;
}

export interface FieldDefinition {
    Name : string;
    Key  : string;
    Type : ParamType;
}

export interface SchemaInstanceListItem {
    SchemaInstanceId   : uuid;
    SchemaInstanceCode : string;
    Fields             : Record<string, any>;
    // AlmanacEntries     : AlmanacEntry[];
    CreatedAt          : Date;
}

export interface WorkflowInsightsResponseDto extends BaseSearchResults {
    FieldDefinitions? : string[];
    Items            : SchemaInstanceListItem[];
}
