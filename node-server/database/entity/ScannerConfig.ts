import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ScanSource } from './Sources';

@Entity()
export class ScannerConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  iconUrl: string;

  @Column({ nullable: true })
  mangasListUrl: string;

  @Column({ nullable: true })
  mangaEnclosingXpath: string;
  @Column({ nullable: true })
  mangaLinkRelativeXpath: string;
  @Column({ nullable: true })
  mangaNameRelativeXpath: string;

  @Column({ nullable: true })
  mangaDescriptionXpath: string;
  @Column({ nullable: true })
  mangaCoverXpath: string;
  @Column({ nullable: true })
  chapterEnclosingXpath: string;
  @Column({ nullable: true })
  chapterLinkRelativeXpath: string;
  @Column({ nullable: true })
  chapterNumberTextRelativeXpath: string;
  @Column({ nullable: true })
  chapterNameRelativeXpath: string;

  @OneToMany(type => ScanSource, source => source.scannerConfig, {
    onDelete: 'CASCADE'
  })
  sources: ScanSource[];
}
