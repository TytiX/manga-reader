import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { ScanSource } from "./Sources.ts";

@Entity()
export class Manga {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @ManyToMany(type => ScanSource)
  @JoinTable()
  sources: ScanSource[];
}
