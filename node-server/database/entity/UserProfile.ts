import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";

import { Manga } from "./Manga";

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    default: 'Guest',
    unique: false
  })
  name: string;

  @ManyToMany(type => Manga, manga => manga.userFavorites)
  @JoinTable()
  favorites: Manga[];
}
