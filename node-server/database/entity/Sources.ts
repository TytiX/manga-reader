import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Chapter } from './Chapter';
import { Manga } from './Manga';
import { ScannerConfig } from './ScannerConfig';

@Entity()
export class ScanSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({
    unique: true
  })
  link: string;

  @Column({
    nullable: true
  })
  coverLink: string;
  @Column({
    nullable: true
  })
  description: string;

  @ManyToOne(type => Manga, manga => manga.sources)
  manga: Manga;

  @ManyToOne(type => ScannerConfig, config => config.sources)
  scannerConfig: ScannerConfig;
  
  @OneToMany(type => Chapter, chapter => chapter.source)
  chapters: Chapter[];
}
