import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Page } from "./Page";
import { ScanSource } from "./Sources";

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn("uuid")
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

  @ManyToOne(type => ScanSource, source => source.chapters)
  source: ScanSource;

  @OneToMany(type => Page, page => page.chapter)
  pages: Page[];
}
