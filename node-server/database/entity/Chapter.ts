import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn} from 'typeorm';
import { ScanSource } from './Sources';
import { Page } from './Page';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true
  })
  name: string;

  @Column('numeric')
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

  @Column({ type: 'simple-json', nullable: true })
  pages: Page[];

  // get pages() {
  //   return this.jsonPages ? JSON.parse(this.jsonPages) : null;
  // }
}
