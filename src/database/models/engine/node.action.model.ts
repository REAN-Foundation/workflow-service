import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Node } from "./node.model";
import { ActionInputParams, ActionOutputParams } from "../../../domain.types/engine/intermediate.types/params.types";
import { ActionType } from "../../../domain.types/engine/engine.enums";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'node_actions' })
export class NodeAction {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: ActionType, nullable: false })
    Type : ActionType;

    @Column({ type: 'int', nullable: false, default: 0 })
    Sequence: number;

    @Column({ type: 'boolean', nullable: false, default: false })
    IsPathAction: boolean;

    @ManyToOne(() => Node, (node) => node.Actions, { nullable: true })
    @JoinColumn()
    ParentNode: Node;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @Column({ type: 'json', nullable: true })
    Input : ActionInputParams;

    @Column({ type: 'json', nullable: true })
    Output : ActionOutputParams;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
