import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { EventType } from "../../../domain.types/enums/event.type";
import { WorkflowMessage } from "../../../domain.types/engine/user.event.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'events' })
export class Event {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: EventType, nullable: false })
    EventType: EventType;

    @Column({ type: 'uuid', nullable: true })
    TenantId: uuid;

    @Column({ type: 'uuid', nullable: true })
    SchemaId: uuid;

    @Column({ type: 'uuid', nullable: true })
    SchemaInstanceId: uuid;

    @Column({ type: 'simple-json', nullable: true })
    UserMessage: WorkflowMessage;

    @Column({ type: 'simple-json', nullable: true })
    Payload: any;

    @Column({ type: 'timestamp', nullable: false })
    EventTimestamp: Date;

    @Column({ type: 'boolean', nullable: false, default: false })
    Handled: boolean;

    @Column({ type: 'timestamp', nullable: true })
    HandledTimestamp: Date;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
