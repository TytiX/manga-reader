import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Chapter } from "./Chapter";

@Entity()
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(type => Chapter, chapter => chapter.chapters)
  chapter: Chapter;
}
