import "reflect-metadata";
import {
    Column,
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import { Question } from "./question.model";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'question_options' })
export class QuestionOption {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @ManyToOne(() => Question, (question) => question.Options)
    Question: Question;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Text : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    ImageUrl : string;

    @Column({ type: 'int', nullable: true })
    Sequence : number;

    @Column({ type: 'simple-json', nullable: true })
    Metadata : any;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
