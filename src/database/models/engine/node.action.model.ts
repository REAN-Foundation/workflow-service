import "reflect-metadata";
import {
    Column,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Node } from "./node.model";
import { ActionInputParams, ActionOutputParams } from "../../../domain.types/engine/intermediate.types";
import { ActionType } from "../../../domain.types/engine/engine.enums";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'node_actions' })
export class NodeAction {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: ActionType, nullable: false })
    ActionType : ActionType;

    @OneToOne(() => Node, (node) => node.Action, { nullable: true })
    ParentNode: Node;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

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
