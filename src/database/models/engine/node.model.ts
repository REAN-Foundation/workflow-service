import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
    JoinColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { NodeAction } from "./node.action.model";
import { Schema } from "./schema.model";
import { NodePath } from "./node.path.model";
import { NodeType } from "../../../domain.types/engine/engine.enums";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'nodes' })
export class Node {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: NodeType, nullable: false, default: NodeType.ExecutionNode })
    Type : NodeType;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Code : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @ManyToOne(() => Node, (node) => node.Children)
    ParentNode: Node;

    @OneToMany(() => Node, (node) => node.ParentNode)
    Children: Node[];

    @ManyToOne(() => Schema, (schema) => schema.Nodes, { onDelete: 'CASCADE' })
    @JoinColumn()
    Schema: Schema;

    @OneToMany(() => NodePath, (path) => path.ParentNode, { cascade: true })
    Paths: NodePath[];

    @OneToMany(() => NodeAction, (path) => path.ParentNode, { cascade: true })
    Actions: NodeAction[];

    @Column({ type: 'simple-json', nullable: true })
    RawData : any;

    @OneToOne(() => NodePath, (path) => path.ParentNode, { nullable: true })
    DefaultNodePath: NodePath;

    @Column({ type: 'uuid', nullable: true })
    ExecutionRuleId: string;

    @Column({ type: 'int', nullable: true })
    ExecutionDelaySeconds: number;

    @Column({ type: 'uuid', nullable: true })
    NextNodeId: string;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
