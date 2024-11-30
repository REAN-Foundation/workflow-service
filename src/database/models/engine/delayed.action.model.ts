import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { QuestionResponseType } from "../../../domain.types/engine/engine.enums";
import { QuestionOption } from "./question.option.model";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'questions' })
export class Question {

    //Please note that, this 'primary key column' is not auto generated.
    //This id is same as nodeId
    @PrimaryColumn('uuid')
    id : string;

    @Column({ type: 'varchar', length: 256, nullable: false })
    QuestionText : string;

    @Column({ type: 'enum', enum: QuestionResponseType, nullable: false, default: QuestionResponseType.SingleChoiceSelection })
    QuestionResponseType : QuestionResponseType;

    @OneToMany(() => QuestionOption, (option) => option.Question, { nullable: true })
    Options: QuestionOption[];

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
