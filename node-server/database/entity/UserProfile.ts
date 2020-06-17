import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";

import { Manga } from "./Manga";
import { Advancement } from "./Advancement";

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

  @OneToMany(type => Advancement, adv => adv.profile)
  advancements: Advancement[];
}
