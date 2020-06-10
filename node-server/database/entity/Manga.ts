import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ScanSource } from "./Sources";

@Entity()
export class Manga {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @OneToMany(type => ScanSource, source => source.manga)
  sources: ScanSource[];
}
