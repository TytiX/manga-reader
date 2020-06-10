import { Chapter } from './Chapter';

export interface Page {
  id: number;
  url: string;
  chapter: Chapter;
}
