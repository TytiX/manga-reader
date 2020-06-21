import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  ManyToOne } from 'typeorm';
import { Manga } from './Manga';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  name: string;

  @OneToMany(type => TagValue, value => value.tag, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  values: TagValue[];

  @ManyToMany(type => Manga, manga => manga.tags)
  mangas: Manga[];
}

@Entity()
export class TagValue {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  value: string;

  @ManyToOne(type => Tag, tag => tag.values)
  tag: Tag;
}
