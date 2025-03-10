import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { WorkflowActivityType } from "../../../domain.types/engine/engine.enums";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'schema_instance_activities' })
export class SchemaInstanceActivity {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: WorkflowActivityType, nullable: false, default: WorkflowActivityType.UserEvent })
    Type: WorkflowActivityType;

    @Column({ type: 'uuid', nullable: true })
    SchemaInstanceId: uuid;

    @Column({ type: 'json', nullable: true })
    Summary: any;

    @Column({ type: 'json', nullable: true })
    Payload: any;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
