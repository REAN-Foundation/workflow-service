import { WorkflowEvent } from '../../../domain.types/engine/event.types';

///////////////////////////////////////////////////////////////////////////////////

export interface IMessagingProvider {
    send(tenantCode: string, toPhone: string, message: WorkflowEvent): Promise<boolean>;
}
