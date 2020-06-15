import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Chapter } from './Chapter';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: number;

  @Column()
  url: string;

  @ManyToOne(type => Chapter, chapter => chapter.pages)
  chapter: Chapter;
}
