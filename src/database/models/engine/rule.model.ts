import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToOne,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Condition } from "./condition.model";
import { RuleAction } from "./rule.action.model";
import { Node } from "./node.model";
import { Schema } from "./schema.model";
import { NodePath } from "./node.path.model";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'rules' })
export class Rule {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @ManyToOne(() => Node, (node) => node.Rules, { onDelete: 'CASCADE' })
    @JoinColumn()
    ParentNode: Node;

    @ManyToOne(() => Schema, (schema) => schema.Nodes)
    Schema: Schema;

    @OneToOne(() => NodePath, (path) => path.Rule, { nullable: true, cascade: true })
    @JoinColumn()
    NodePath: NodePath;

    @OneToOne(() => Condition, (condition) => condition.Rule, { nullable: true, cascade: true })
    @JoinColumn()
    Condition: Condition;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
