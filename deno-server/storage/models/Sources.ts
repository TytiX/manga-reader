import { Chapter } from "./Chapter.ts";

export interface ScanSource {
  name: string;
  link: string;
  chapters: Chapter[];
}
