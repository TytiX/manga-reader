import { v4 } from "https://deno.land/std/uuid/mod.ts";

import { Mangas, Manga } from "./models/Manga.ts";
import { ScanSource } from "./models/Sources.ts";
import { Chapter } from "./models/Chapter.ts";
import { Page } from "./models/Page.ts";

export class Storage {
  private static instance: Storage;
  datas: Mangas = [];

  private constructor() {
  }

  static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  getAll(): Mangas {
    return this.datas;
  }
  find(mangaId: string): Manga | undefined {
    return this.datas.find((m: Manga) => {
      return m.id === mangaId;
    });
  }
  findByName(name: string): Manga | undefined {
    return this.datas.find((m: Manga) => {
      return m.name === name;
    });
  }
  findBySourceLink(link: string): Manga | undefined {
    return this.datas.find((m: Manga) => {
      return m.sources.find((s: ScanSource) => {
        return s.link === link;
      });
    });
  }
  findChapter(mangaId: string, source: string, chapter: number): Chapter | undefined {
    return undefined;
  }
  findPage(mangaId: string, source: string, chapter: number, page: number): Page | undefined {
    return undefined;
  }
  create(name: string, source: ScanSource): Manga {
    let manga = new Manga();
    manga.id = v4.generate();
    manga.name = name;
    manga.sources.push(source);
    this.datas.push(manga);
    return manga;
  }
  addScanSource(manga: Manga, source: ScanSource): Manga {
    manga.sources.push(source);
    return manga;
  }
}
