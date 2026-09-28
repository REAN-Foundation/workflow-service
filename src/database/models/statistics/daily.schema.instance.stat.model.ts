import "reflect-metadata";
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'daily_schema_instance_stats' })
@Unique(['TenantId', 'SchemaId', 'Date'])
export class DailySchemaInstanceStat {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'uuid', nullable: false })
    TenantId : string;

    @Column({ type: 'uuid', nullable: false })
    SchemaId : string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    SchemaName : string;

    @Column({ type: 'date', nullable: false })
    Date : string;

    @Column({ type: 'int', nullable: false, default: 0 })
    Triggered : number;

    @Column({ type: 'int', nullable: false, default: 0 })
    Completed : number;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

}
