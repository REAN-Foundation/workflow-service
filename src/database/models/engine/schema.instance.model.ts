import "reflect-metadata";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Schema } from "./schema.model";
import { NodeInstance } from "./node.instance.model";
import { AlmanacObject } from "../../../modules/engine.execution/almanac";
import { ContextParams } from "../../../domain.types/engine/intermediate.types/params.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'schema_instances' })
export class SchemaInstance {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'uuid', nullable: false })
    TenantId : string;

    @ManyToOne(() => Schema)
    @JoinColumn()
    Schema: Schema;

    @Column({ type: 'uuid', nullable: true })
    ParentSchemaInstanceId : string;

    @Column({ type: 'varchar', length: 64, nullable: false })
    Code : string;

    @Column({ type: 'simple-json', nullable: true })
    ContextParams: ContextParams;

    @OneToMany(() => NodeInstance, (nodeInstance) => nodeInstance.SchemaInstance)
    NodeInstances : NodeInstance[];

    @OneToOne(() => NodeInstance)
    @JoinColumn()
    RootNodeInstance: NodeInstance;

    @OneToOne(() => NodeInstance)
    @JoinColumn()
    CurrentNodeInstance: NodeInstance;

    @Column({ type: 'boolean', nullable: false, default: false })
    ExecutionStarted: boolean;

    @Column({ type: 'datetime', nullable: true })
    ExecutionStartedTimestamp: Date;

    @Column({ type: 'simple-json', nullable: true })
    AlmanacObjects: AlmanacObject[];

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
