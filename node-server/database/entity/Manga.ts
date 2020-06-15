import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable } from 'typeorm';

import { ScanSource } from './Sources';
import { Tag } from './Tag';
import { Gender } from './Gender';

@Entity()
export class Manga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(type => ScanSource, source => source.manga)
  sources: ScanSource[];

  // @ManyToMany(type => Tag, tag => tag.mangas)
  // @JoinTable()
  // tags: Tag[];

  // @ManyToMany(type => Gender, gender => gender.mangas)
  // @JoinTable()
  // genres: Gender[];
}
