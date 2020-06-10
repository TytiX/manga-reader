import { CasualDB, CollectionOperator } from "https://deno.land/x/casualdb@0.1.1/mod.ts";

import { Logger } from "../Logger.ts";

import { Manga } from "./models/Manga.ts";
import { ScanSource } from "./models/Sources.ts";
import { Page } from "./models/Page.ts";
import { Chapter } from "./models/Chapter.ts";

// create an interface to describe the structure of your JSON
interface Schema {
  mangas: Array<Manga>;
  scansources: Array<ScanSource>;
  chapters: Array<Chapter>;
  pages: Array<Page>;
}


export default class Database {
  db: CasualDB<Schema>;
  constructor() {
    this.db = new CasualDB<Schema>();
    this.init();
  }
  async init() {
    await this.db.connect("./database.json"); // "connect" to the db (JSON file)
  }

  async getAll(): Promise<CollectionOperator<Manga>> {
    return await this.db.get<Schema['mangas']>('mangas');
  }

  async addManga(manga: Manga) {
    try {
      await this.db.write('mangas', [
        {
          id: manga.id,
          name: manga.name,
          sources: []
        }
      ]);
    } catch (e) {
      Logger.error(e);
    }
  }
};
