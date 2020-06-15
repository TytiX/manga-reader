import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn, 
  UpdateDateColumn} from 'typeorm';
import { Page } from './Page';
import { ScanSource } from './Sources';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true
  })
  name: string;

  @Column()
  number: number;

  @Column({
    unique: true
  })
  link: string;

  @Column({
    default: false
  })
  scanned: boolean

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @ManyToOne(type => ScanSource, source => source.chapters, {
    onDelete: 'CASCADE'
  })
  source: ScanSource;

  @OneToMany(type => Page, page => page.chapter)
  pages: Page[];
}
