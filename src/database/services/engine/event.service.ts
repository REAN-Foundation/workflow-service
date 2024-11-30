import { Event } from '../../models/engine/event.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../database.connector';
import { FindManyOptions, Repository } from 'typeorm';
import { EventMapper } from '../../mappers/engine/event.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    EventCreateModel,
    EventResponseDto,
    EventSearchFilters,
    EventSearchResults
} from '../../../domain.types/engine/event.types';

///////////////////////////////////////////////////////////////////////

export class EventService extends BaseService {

    //#region Repositories

    _eventRepository: Repository<Event> = Source.getRepository(Event);

    //#endregion

    public create = async (createModel: EventCreateModel)
        : Promise<EventResponseDto> => {

        var eventModel = {
            EventType        : createModel.EventType,
            SchemaId         : createModel.SchemaId,
            SchemaInstanceId : createModel.SchemaInstanceId,
            EventTimeStamp   : createModel.EventTimeStamp,
            UserMessage      : createModel.UserMessage,
            Payload          : createModel.Payload,
        };
        const event = this._eventRepository.create(eventModel);
        var record = await this._eventRepository.save(event);
        return EventMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<EventResponseDto> => {
        try {
            var event = await this._eventRepository.findOne({
                where : {
                    id : id
                }
            });
            return EventMapper.toResponseDto(event);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: EventSearchFilters)
        : Promise<EventSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._eventRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => EventMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._eventRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._eventRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: EventSearchFilters) => {

        var search : FindManyOptions<Event> = {
            relations : {
            },
            where : {
            }
        };

        if (filters.TenantId) {
            search.where['TenantId'] = filters.TenantId;
        }
        if (filters.EventType) {
            search.where['EventType'] = filters.EventType;
        }
        if (filters.SchemaId) {
            search.where['SchemaId'] = filters.SchemaId;
        }
        if (filters.SchemaInstanceId) {
            search.where['SchemaInstanceId'] = filters.SchemaInstanceId;
        }

        return search;
    };

    //#endregion

}
