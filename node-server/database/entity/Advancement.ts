import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from "typeorm";
import { Chapter } from "./Chapter";
import { UserProfile } from "./UserProfile";
import { ScanSource } from "./Sources";

@Entity()
export class Advancement {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  pageNumber: number;

  @ManyToOne(type => ScanSource)
  source: ScanSource;

  @ManyToOne(type => Chapter)
  chapter: Chapter;

  @ManyToOne(type => UserProfile, profile => profile.advancements)
  profile: UserProfile;
}
