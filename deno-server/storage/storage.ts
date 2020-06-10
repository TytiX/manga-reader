import { v4 } from "https://deno.land/std/uuid/mod.ts";

import Database from "./database.ts";

import { Manga } from "./models/Manga.ts";
import { ScanSource } from "./models/Sources.ts";
import { Chapter } from "./models/Chapter.ts";
import { Page } from "./models/Page.ts";

export class Storage {
  db: Database;
  constructor() {
    this.db = new Database();
  }

  async getAll() {
    return await this.db.getAll();
  }
  find(mangaId: string): Manga | undefined {
    return undefined; //this.db.findMangaById(mangaId);
  }
  findByName(name: string): Manga | undefined {
    return undefined; // this.mangaStore.mangas.find((m: Manga) => {
    //   return m.name === name;
    // });
  }
  findBySourceLink(link: string): Manga | undefined {
    return undefined; //this.mangaStore.mangas.find((m: Manga) => {
    //   return m.sources.find((s: ScanSource) => {
    //     return s.link === link;
    //   });
    // });
  }
  findChapter(mangaId: string, source: string, chapter: number): Chapter | undefined {
    return undefined;
  }
  findPage(mangaId: string, source: string, chapter: number, page: number): Page | undefined {
    return undefined;
  }
  create(name: string, source: ScanSource): Manga {
    const manga: Manga = {
      id: v4.generate(),
      name,
      sources: []
    };
    manga.sources.push(source);

    this.db.addManga(manga);

    return manga;
  }
  addScanSource(manga: Manga, source: ScanSource): Manga {
    manga.sources.push(source);
    return manga;
  }
}
