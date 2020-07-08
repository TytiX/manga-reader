import { Chapter } from './Chapter';

export interface Page {
  number: number;
  url: string;
  chapter: Chapter;
}
