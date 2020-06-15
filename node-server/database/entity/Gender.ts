import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Manga } from './Manga';

@Entity()
export class Gender {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  name: string;
  @ManyToMany(type => Manga, manga => manga.genders)
  mangas: Manga[];
}
