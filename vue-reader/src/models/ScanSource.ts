import { Manga } from './Manga';
import { Chapter } from './Chapter';

export interface ScanSource {
  id: string;
  name: string;
  link: string;
  manga: Manga;
  chapters: Chapter[];
}
