import "reflect-metadata";
import {
    Column,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Node } from "./node.model";
import { Rule } from "./rule.model";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'node_paths' })
export class NodePath {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @ManyToOne(() => Node, (node) => node.Paths)
    ParentNode: Node;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @OneToOne(() => Rule, (rule) => rule.NodePath, { nullable: true })
    Rule: Rule;

    @OneToOne(() => Node, { nullable: true })
    @JoinColumn()
    NextNode: Node;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
