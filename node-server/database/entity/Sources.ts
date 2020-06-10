import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Chapter } from "./Chapter";
import { Manga } from "./Manga";

@Entity()
export class ScanSource {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  name: string;
  @Column({
    unique: true
  })
  link: string;

  @ManyToOne(type => Manga, manga => manga.sources)
  manga: Manga;
  
  @OneToMany(type => Chapter, chapter => chapter.source)
  chapters: Chapter[];
}
