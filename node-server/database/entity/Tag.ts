import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Manga } from './Manga';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  name: string;
  @ManyToMany(type => Manga)
  mangas: Manga[];
}
