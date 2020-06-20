import { Manga } from './Manga';

export interface TagValue {
  id: number;
  value: string;
}

export interface Tag {
  id: number;
  name: string;

  values: TagValue[];

  mangas: Manga[];
}