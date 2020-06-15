import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { ScanSource } from "./Sources";

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;

  @ManyToMany(type => ScanSource)
  favorites: ScanSource[];
}
