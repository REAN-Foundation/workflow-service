import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Node } from "../engine/node.model";
import { SchemaType } from "../../../domain.types/engine/engine.enums";
import { ContextParams } from "../../../domain.types/engine/intermediate.types/params.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'schema' })
export class Schema {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @Column({ type: 'enum', enum: SchemaType, nullable: false, default: SchemaType.ChatBot })
    Type : SchemaType;

    @Column({ type: 'uuid', nullable: false })
    TenantId : string;

    @Column({ type: 'uuid', nullable: true })
    RootNodeId: string;

    @OneToMany(() => Node, (node) => node.Schema, {
        cascade : true,
    })
    Nodes: Node[];

    @Column({ type: 'simple-json', nullable: true })
    ContextParams : ContextParams;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
