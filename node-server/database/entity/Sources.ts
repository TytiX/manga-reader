import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Chapter } from './Chapter';
import { Manga } from './Manga';
import { ScannerConfig } from './ScannerConfig';

@Entity()
export class ScanSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ unique: true })
  link: string;

  @Column({ nullable: true })
  coverLink: string;
  @Column({ nullable: true })
  description: string;
  @Column({ default: 'normal' })
  reading: string;

  @Column({ default: '1990-01-01' })
  lastScan: Date;

  @ManyToOne(type => Manga, manga => manga.sources, { onDelete: 'CASCADE' })
  manga: Manga;
  @ManyToOne(type => ScannerConfig, config => config.sources, { onDelete: 'CASCADE' })
  scannerConfig: ScannerConfig;
  @OneToMany(type => Chapter, chapter => chapter.source, { onDelete: 'DEFAULT' })
  chapters: Chapter[];
}
