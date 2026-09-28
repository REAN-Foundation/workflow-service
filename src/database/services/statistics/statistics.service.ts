import { Between, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Source } from '../../database.connector';
import { BaseService } from '../base.service';
import { logger } from '../../../logger/logger';
import { ApiError, ErrorHandler } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { DateStringFormat, DurationType } from '../../../domain.types/miscellaneous/time.types';
import { TimeUtils } from '../../../common/utilities/time.utils';
import { SchemaInstance } from '../../models/engine/schema.instance.model';
import { Schema } from '../../models/engine/schema.model';
import { DailySchemaInstanceStat } from '../../models/statistics/daily.schema.instance.stat.model';
import {
    AlmanacEntry,
    DailySchemaInstanceTrendFilters,
    DailySchemaInstanceTrendResponseDto,
    DailySchemaTrendPoint,
    SchemaInstanceListFilters,
    SchemaInstanceListItem,
    StatisticsBaseFilters,
    WorkflowDefinitionStatItem,
    WorkflowDefinitionStatsFilters,
    WorkflowDefinitionStatsResponseDto,
    WorkflowInsightsResponseDto,
    WorkflowInstanceStatsResponseDto,
    WorkflowInstanceStatus,
} from '../../../domain.types/statistics/statistics.types';

///////////////////////////////////////////////////////////////////////////////

export class StatisticsService extends BaseService {

    //#region Repositories

    _schemaInstanceRepository: Repository<SchemaInstance> = Source.getRepository(SchemaInstance);

    _dailyStatRepository: Repository<DailySchemaInstanceStat> = Source.getRepository(DailySchemaInstanceStat);

    _schemaRepository: Repository<Schema> = Source.getRepository(Schema);

    //#endregion

    public getWorkflowInstanceStats = async (filters: StatisticsBaseFilters)
        : Promise<WorkflowInstanceStatsResponseDto> => {
        try {
            const STATUS_CASE = `
                CASE
                    WHEN schemaInstance.Terminated = true THEN 'Completed'
                    ELSE 'Running'
                END`;

            const qb = this._schemaInstanceRepository.createQueryBuilder('schemaInstance')
                .select(STATUS_CASE, 'status')
                .addSelect('COUNT(schemaInstance.id)', 'count')
                .where('schemaInstance.TenantId = :tenantId', { tenantId: filters.TenantId });

            if (filters.CreatedDateFrom) {
                qb.andWhere('schemaInstance.CreatedAt >= :from', { from: filters.CreatedDateFrom });
            }
            if (filters.CreatedDateTo) {
                qb.andWhere('schemaInstance.CreatedAt <= :to', { to: filters.CreatedDateTo });
            }
            qb.groupBy(STATUS_CASE);

            const rows = await qb.getRawMany();

            const counts: Record<WorkflowInstanceStatus, number> = {
                Running   : 0,
                Completed : 0,
            };
            let totalCount = 0;
            for (const row of rows) {
                const c = parseInt(row.count, 10);
                counts[row.status as WorkflowInstanceStatus] = c;
                totalCount += c;
            }

            return {
                TenantId           : filters.TenantId,
                DateRange          : { From: filters.CreatedDateFrom ?? null, To: filters.CreatedDateTo ?? null },
                TotalCount         : totalCount,
                CompletedInstances : counts.Completed,
                RunningInstances   : counts.Running,
            };

        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve workflow instance statistics!', error);
        }
    };

    public getWorkflowDefinitionStats = async (filters: WorkflowDefinitionStatsFilters)
        : Promise<WorkflowDefinitionStatsResponseDto> => {
        try {
            const qb = this._schemaInstanceRepository.createQueryBuilder('si')
                .innerJoin('si.Schema', 'schema')
                .select('schema.id', 'schemaId')
                .addSelect('schema.Name', 'schemaName')
                .addSelect('schema.Type', 'schemaType')
                .addSelect('COUNT(si.id)', 'totalInstances')
                .addSelect(`SUM(CASE WHEN si.Terminated = false THEN 1 ELSE 0 END)`, 'runningInstances')
                .addSelect(`SUM(CASE WHEN si.Terminated = true THEN 1 ELSE 0 END)`, 'completedInstances')
                .where('si.TenantId = :tenantId', { tenantId: filters.TenantId });

            if (filters.SchemaId) {
                qb.andWhere('schema.id = :schemaId', { schemaId: filters.SchemaId });
            }
            if (filters.CreatedDateFrom) {
                qb.andWhere('si.CreatedAt >= :from', { from: filters.CreatedDateFrom });
            }
            if (filters.CreatedDateTo) {
                qb.andWhere('si.CreatedAt <= :to', { to: filters.CreatedDateTo });
            }

            qb.groupBy('schema.id').addGroupBy('schema.Name').addGroupBy('schema.Type');

            const rows = await qb.getRawMany();

            const items: WorkflowDefinitionStatItem[] = rows.map(row => {
                const total = parseInt(row.totalInstances, 10);
                const completed = parseInt(row.completedInstances, 10);
                const rate = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;
                return {
                    SchemaId           : row.schemaId,
                    SchemaName         : row.schemaName,
                    SchemaType         : row.schemaType,
                    TotalInstances     : total,
                    RunningInstances   : parseInt(row.runningInstances, 10),
                    CompletedInstances : completed,
                    CompletionRate     : rate,
                };
            });

            return {
                TenantId     : filters.TenantId,
                DateRange    : { From: filters.CreatedDateFrom ?? null, To: filters.CreatedDateTo ?? null },
                TotalSchemas : items.length,
                Items        : items,
            };
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve workflow definition statistics!', error);
        }
    };

    public getDailySchemaInstanceTrend = async (filters: DailySchemaInstanceTrendFilters)
        : Promise<DailySchemaInstanceTrendResponseDto> => {
        try {
            const from = filters.CreatedDateFrom ?? TimeUtils.subtractDuration(new Date(), 30, DurationType.Day);
            const to = filters.CreatedDateTo ?? new Date();
            const fromStr = TimeUtils.getDateString(from, DateStringFormat.YYYY_MM_DD);
            const toStr = TimeUtils.getDateString(to, DateStringFormat.YYYY_MM_DD);
            const todayStr = TimeUtils.getDateString(new Date(), DateStringFormat.YYYY_MM_DD);

            const snapshotQb = this._dailyStatRepository.createQueryBuilder('d')
                .where('d.TenantId = :tenantId', { tenantId: filters.TenantId })
                .andWhere('d.Date BETWEEN :fromStr AND :toStr', { fromStr, toStr });
            if (filters.SchemaId) {
                snapshotQb.andWhere('d.SchemaId = :schemaId', { schemaId: filters.SchemaId });
            }
            const snapshotRows = await snapshotQb.getMany();

            const points: DailySchemaTrendPoint[] = snapshotRows
                .filter(r => r.Date !== todayStr)
                .map(r => ({ Date: r.Date, SchemaId: r.SchemaId, SchemaName: r.SchemaName, Triggered: r.Triggered, Completed: r.Completed }));

            if (todayStr >= fromStr && todayStr <= toStr) {
                const todayPoints = await this.computeDailyPoints(todayStr, filters.TenantId, filters.SchemaId);
                points.push(...todayPoints);
            }

            return {
                TenantId  : filters.TenantId,
                DateRange : { From: from, To: to },
                Points    : points.sort((a, b) => a.Date.localeCompare(b.Date) || a.SchemaName.localeCompare(b.SchemaName)),
            };
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve daily schema instance trend!', error);
        }
    };

    public generateDailySnapshot = async (forDate?: Date): Promise<void> => {
        try {
            const date = forDate ?? TimeUtils.subtractDuration(new Date(), 1, DurationType.Day);
            const dateStr = TimeUtils.getDateString(date, DateStringFormat.YYYY_MM_DD);

            const rows = await this.computeDailyPoints(dateStr);

            if (rows.length > 0) {
                await this._dailyStatRepository.upsert(rows, ['TenantId', 'SchemaId', 'Date']);
            }

            logger.info(`Daily statistics snapshot generated for ${dateStr}: ${rows.length} rows.`);
        } catch (error) {
            logger.error('Error generating daily statistics snapshot: ' + error.message);
        }
    };

    public getWorkflowInsights =
        async (filters: SchemaInstanceListFilters, fields: string[])        : Promise<WorkflowInsightsResponseDto> => {
            try {
                const where: FindOptionsWhere<SchemaInstance> = {
                    TenantId : filters.TenantId,
                };
                if (filters.SchemaId) {
                    where.Schema = { id: filters.SchemaId } as any;
                }
                if (filters.CreatedDateFrom || filters.CreatedDateTo) {
                    where.CreatedAt = Between(filters.CreatedDateFrom ?? new Date(0), filters.CreatedDateTo ?? new Date());
                }

                const search: FindManyOptions<SchemaInstance> = { where, order: { CreatedAt: 'DESC' } };
                const { search: s, pageIndex, limit } = this.addSortingAndPagination(search, filters);
                const [list, count] = await this._schemaInstanceRepository.findAndCount(s);

                const items: SchemaInstanceListItem[] = list.map(si => {
                    const entries: AlmanacEntry[] = (si.AlmanacObjects ?? []).map((a: any) => ({ Key: a.Name, Value: a.Data }));
                    const almanacMap: Record<string, any> = {};
                    entries.forEach(e => {
                        almanacMap[e.Key] = e.Value;
                    });

                    const fieldValues: Record<string, any> = {};
                    for (const key of fields) {
                        if (Object.prototype.hasOwnProperty.call(almanacMap, key)) {
                            fieldValues[key] = almanacMap[key];
                        } else {
                            fieldValues[key] = null;
                        }
                    }

                    return {
                        SchemaInstanceId   : si.id,
                        SchemaInstanceCode : si.Code,
                        Status             : si.Terminated ? 'Completed' : 'Running',
                        Fields             : fieldValues,
                        // AlmanacEntries     : entries,
                        CreatedAt          : si.CreatedAt,
                    };
                });

                return {
                    TotalCount       : count,
                    RetrievedCount   : items.length,
                    PageIndex        : pageIndex,
                    ItemsPerPage     : limit,
                    Order            : 'descending',
                    OrderedBy        : 'CreatedAt',
                    FieldDefinitions : fields,
                    Items            : items
                };
            } catch (error) {
                if (error instanceof ApiError) {
                    throw error;
                }
                logger.error(error.message);
                ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve workflow insights!', error);
            }
        };

    //#region Privates

    private computeDailyPoints = async (dateStr: string, tenantId?: uuid, schemaId?: uuid)
        : Promise<(DailySchemaTrendPoint & { TenantId: string })[]> => {

        const query = this._schemaInstanceRepository.createQueryBuilder('si')
            .innerJoin('si.Schema', 'schema')
            .select('si.TenantId', 'tenantId')
            .addSelect('schema.id', 'schemaId')
            .addSelect('schema.Name', 'schemaName')
            .addSelect('COUNT(si.id)', 'triggered')
            .addSelect('SUM(CASE WHEN si.Terminated = true THEN 1 ELSE 0 END)', 'completed')
            .where('DATE(si.CreatedAt) = :dateStr', { dateStr });

        if (tenantId) {
            query.andWhere('si.TenantId = :tenantId', { tenantId });
        }
        if (schemaId) {
            query.andWhere('schema.id = :schemaId', { schemaId });
        }

        const rows = await query
            .groupBy('si.TenantId')
            .addGroupBy('schema.id')
            .addGroupBy('schema.Name')
            .getRawMany();

        rows.forEach(row => {
            logger.info(`Daily points for ${row.tenantId} / ${row.schemaName} (${row.schemaId}) on ${dateStr}: Triggered=${row.triggered}, Completed=${row.completed}`);
        });
        return rows.map(row => ({
            TenantId   : row.tenantId,
            Date       : dateStr,
            SchemaId   : row.schemaId,
            SchemaName : row.schemaName,
            Triggered  : parseInt(row.triggered, 10),
            Completed  : parseInt(row.completed, 10),
        }));
    };

    //#endregion

}
