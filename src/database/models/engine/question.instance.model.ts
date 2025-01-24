import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { QuestionResponseType } from "../../../domain.types/engine/engine.enums";
import { uuid } from "../../../domain.types/miscellaneous/system.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'question_instances' })
export class QuestionInstance {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'uuid', nullable: false })
    QuestionId : uuid;

    @Column({ type: 'uuid', nullable: false })
    NodeInstanceId : uuid;

    @Column({ type: 'varchar', length: 512, nullable: false })
    QuestionText : string;

    @Column({ type: 'enum', enum: QuestionResponseType, nullable: false, default: QuestionResponseType.SingleChoiceSelection })
    ResponseType : QuestionResponseType;

    @Column({ type: 'boolean', nullable: false, default: false })
    QuestionPosed : boolean;

    @Column({ type: 'boolean', nullable: false, default: false })
    ResponseReceived : boolean;

    @Column({ type: 'uuid', nullable: true })
    SelectedOptionId: uuid;

    @Column({ type: 'int', nullable: true })
    SelectedOptionSequence : number;

    @Column({ type: 'varchar', length: 256, nullable: true })
    ResponseText : string;

    @Column({ type: 'boolean', nullable: true })
    ResponseBoolean : string;

    @Column({ type: 'int', nullable: true })
    ResponseInteger : number;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
