import "reflect-metadata";
import { ExecutionStatus, NodeType } from "../../../domain.types/engine/engine.enums";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Rule } from "./rule.model";
import { Node } from './node.model';
import { SchemaInstance } from "./schema.instance.model";
import { NodePath } from "./node.path.model";
import { ActionInputParams } from "../../../domain.types/engine/params.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'node_instances' })
export class NodeInstance {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: NodeType, nullable: false, default: NodeType.ExecutionNode })
    Type : NodeType;

    @ManyToOne(() => Node)
    @JoinColumn()
    Node: Node;

    @ManyToOne(() => SchemaInstance, (schemaInstance) => schemaInstance.NodeInstances)
    SchemaInstance: SchemaInstance;

    @ManyToOne(() => NodeInstance, (parentNodeInstance) => parentNodeInstance.ChildrenNodeInstances)
    ParentNodeInstance: NodeInstance;

    @OneToMany(() => NodeInstance, (childNodeInstance) => childNodeInstance.ParentNodeInstance)
    ChildrenNodeInstances: NodeInstance[];

    @Column({ type: 'enum', enum: ExecutionStatus, nullable: false, default: ExecutionStatus.Pending })
    ExecutionStatus : ExecutionStatus;

    @Column({ type: 'json', nullable: true })
    Input : ActionInputParams;

    @Column({ type: 'timestamp', nullable: true })
    StatusUpdateTimestamp : Date;

    @Column({ type: 'simple-json', nullable: true })
    ExecutionResult : any;

    @Column({ type: 'int', nullable: false, default: 0 })
    TimerNumberOfTriesCompleted: number;

    @Column({ type: 'boolean', nullable: false, default: false })
    TimerFinished: boolean;

    @OneToOne(() => Rule, { nullable: true })
    ChosenNodePath: NodePath;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
