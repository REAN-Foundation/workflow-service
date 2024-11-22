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
import { Rule } from "./rule.model";
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

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @ManyToOne(() => Node, (node) => node.Children)
    ParentNode: Node;

    @OneToMany(() => Node, (node) => node.ParentNode)
    Children: Node[];

    @OneToMany(() => NodePath, (path) => path.ParentNode, { cascade: true })
    Paths: NodePath[];

    @ManyToOne(() => Schema, (schema) => schema.Nodes, { onDelete: 'CASCADE' })
    @JoinColumn()
    Schema: Schema;

    @OneToMany(() => Rule, (rule) => rule.ParentNode, {
        cascade  : true,
        nullable : true,
    })
    Rules: Rule[];

    @OneToOne(() => NodeAction, (action) => action.ParentNode, { onDelete: 'CASCADE' })
    @JoinColumn()
    Action: NodeAction;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
