import { soxa } from 'https://deno.land/x/soxa/mod.ts'

import { createRequire } from "https://deno.land/std/node/module.ts";

const require = createRequire(import.meta.url);
var xpath = require('xpath')
  , dom = require('xmldom').DOMParser

import { Logger } from "../Logger.ts";
import { Storage } from "../storage/storage.ts";
import { Manga } from "../storage/models/Manga.ts";

export interface SiteScanConfig {
  name: string;

  mangasUrl: string;

  pagination: boolean;
  paginationXpath: string;

  mangaEnclosingXpath: string;
  mangaLinkRelativeXpath: string;
  mangaNameRelativeXpath: string;

  mangaLinkXpath: string;
  mangaNameXpath: string;
}

export class Scanner {
  config: SiteScanConfig;
  storage: Storage;
  constructor(config: SiteScanConfig) {
    this.config = config;
    this.storage = new Storage();
    Logger.info(`Scanner config: ${JSON.stringify(config)}`);
  }

  private scanMangas() {
    soxa.get(this.config.mangasUrl).then( (response) => {
      Logger.info(`response : ${JSON.stringify(Object.keys(response))}`);
      const doc = new dom().parseFromString(response.data);

      var mangaEncloseNodes = xpath.select(this.config.mangaEnclosingXpath, doc);
      Logger.info(`found link nodes : ${JSON.stringify(mangaEncloseNodes.length)}`);

      mangaEncloseNodes.forEach( (node: any) => {
        Logger.info(`${node}`);
        const parsedNode = new dom().parseFromString(`${node}`);
        const nodeLink = xpath.select1(this.config.mangaLinkRelativeXpath, parsedNode);
        const name = xpath.select1(this.config.mangaNameRelativeXpath, parsedNode);

        Logger.info(`${name}: ${nodeLink.value}`);

        const manga = this.searchOrCreate(name, nodeLink.value);
        this.scanManga(manga);
      });
    });
  }

  private scanManga(manga: Manga) {
    // Logger.info(`scanning manga: ${JSON.stringify(manga)}`)
  }

  private scanChapter() {

  }

  private searchOrCreate(name: string, link: string): Manga {
    let manga = this.storage.findBySourceLink(link);
    Logger.info(`manga by link: ${manga}`);
    if (!manga) {
      manga = this.storage.findByName(name);
      Logger.info(`manga by name: ${manga}`);
      if (!manga) { // create manga
        manga = this.storage.create(name, { name: this.config.name, link: link, chapters: [] });
      } else { // add scan source to existing manga
        manga = this.storage.addScanSource(manga, { name: this.config.name, link: link, chapters: [] })
      }
    }
    return manga;
  }

  scan() {
    // todo
    this.scanMangas();
  }
}
