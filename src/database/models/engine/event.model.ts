import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
} from 'typeorm';
import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { Context } from "./context.model";
import { EventType } from "../../../domain.types/enums/event.type";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'events' })
export class Event {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: EventType, nullable: false })
    EventType: EventType;

    @ManyToOne(() => Context)
    Context: Context;

    @Column({ type: 'uuid', nullable: true })
    ReferenceId: uuid;

    @Column({ type: 'simple-json', nullable: true })
    Payload: any;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
