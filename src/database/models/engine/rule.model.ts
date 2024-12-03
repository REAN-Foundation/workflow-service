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
import { Node } from "./node.model";
import { Schema } from "./schema.model";
import { NodePath } from "./node.path.model";
import { uuid } from "../../../domain.types/miscellaneous/system.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'rules' })
export class Rule {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @ManyToOne(() => Node, (node) => node.ParentNode)
    @JoinColumn()
    ParentNode: Node;

    @ManyToOne(() => Schema, (schema) => schema.Nodes)
    Schema: Schema;

    @OneToOne(() => NodePath, (path) => path.Rule, { nullable: true, cascade: true })
    @JoinColumn()
    NodePath: NodePath;

    @Column({ type: 'uuid', nullable: true })
    ConditionId: uuid;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
