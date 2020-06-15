import { Manga } from './Manga';
import { Chapter } from './Chapter';

export interface ScanSource {
  id: string;
  name: string;
  link: string;
  coverLink: string;
  description: string;

  manga: Manga;
  chapters: Chapter[];
}
