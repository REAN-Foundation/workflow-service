import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { ActionType } from "../../../domain.types/engine/engine.enums";
import { ActionInputParams } from "../../../domain.types/engine/params.types";
import { ActionOutputParams } from "../../../domain.types/engine/params.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'node_action_instances' })
export class NodeActionInstance {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: ActionType, nullable: false })
    ActionType : ActionType;

    @Column({ type: 'int', nullable: false, default: 0 })
    Sequence: number;

    @Column({ type: 'uuid', nullable: false })
    NodeId: string;

    @Column({ type: 'uuid', nullable: false })
    NodeInstanceId: string;

    @Column({ type: 'uuid', nullable: false })
    ActionId: string;

    @Column({ type: 'uuid', nullable: false })
    SchemaInstanceId: string;

    @Column({ type: 'boolean', nullable: false, default: false })
    Executed: boolean;

    @Column({ type: 'date', nullable: true })
    ExecutionTimestamp: Date;

    @Column({ type: 'simple-json', nullable: true })
    Input : ActionInputParams;

    @Column({ type: 'simple-json', nullable: true })
    Output : ActionOutputParams;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
