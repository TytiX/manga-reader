import { Mangas, Manga } from "./models/Manga.ts";
import { Chapter } from "./models/Chapter.ts";
import { Page } from "./models/Page.ts";

export class Storage {
  getAll(): Mangas {
    return [];
  }
  find(mangaId: string): Manga | undefined {
    return undefined;
  }
  findChapter(mangaId: string, source: string, chapter: number): Chapter | undefined {
    return undefined;
  }
  findPage(mangaId: string, source: string, chapter: number, page: number): Page | undefined {
    return undefined;
  }
}
