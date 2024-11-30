import "reflect-metadata";
import { ExecutionStatus } from "../../../domain.types/engine/engine.enums";
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

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'node_instances' })
export class NodeInstance {

    @PrimaryGeneratedColumn('uuid')
    id : string;

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

    @Column({ type: 'timestamp', nullable: true })
    StatusUpdateTimestamp : Date;

    @OneToOne(() => Rule, { nullable: true })
    ChosenNodePath: NodePath;

    @Column({ type: 'boolean', nullable: false, default: false })
    Executed: boolean;

    @Column({ type: 'simple-json', nullable: true })
    ExecutionResult : any;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
