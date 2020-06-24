import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn} from 'typeorm';
import { ScanSource } from './Sources';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true
  })
  name: string;

  @Column('double')
  number: number;

  @Column({ unique: true })
  link: string;

  @Column({ default: false })
  scanned: boolean

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @ManyToOne(type => ScanSource, source => source.chapters, { onDelete: 'CASCADE' })
  source: ScanSource;

  @Column({ nullable: true })
  jsonPages: string;

  get pages() {
    return this.jsonPages ? JSON.parse(this.jsonPages) : null;
  }
}
