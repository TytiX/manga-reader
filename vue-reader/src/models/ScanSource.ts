import { Manga } from './Manga';
import { Chapter } from './Chapter';
import { ScannerConfig } from './ScannerConfig';

export interface ScanSource {
  id: string;
  name: string;
  link: string;
  coverLink: string;
  description: string;

  manga: Manga;
  scannerConfig: ScannerConfig;
  chapters: Chapter[];
}
