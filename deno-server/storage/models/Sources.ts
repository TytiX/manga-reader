import { Chapters } from "./Chapter.ts";

export type ScanSources = ScanSource[];
export class ScanSource {
  name: string = "";
  link: string = "";
  chapters: Chapters = [];
}
