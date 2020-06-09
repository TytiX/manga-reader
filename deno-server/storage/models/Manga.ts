import { ScanSources } from "./Sources.ts";

export type Mangas = Manga[];
export class Manga {
  id: string = "";
  name: string = "";
  sources: ScanSources = [];
}
