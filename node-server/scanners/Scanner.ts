import { DOMParser } from 'xmldom';
import * as xpath from 'xpath';
import axios from 'axios';

import logger from '../logger';
import { Database } from '../database/Database';

import { ScannerConfig, Manga, ScanSource, Chapter } from '../database/entity';

export class Scanner {
  config: ScannerConfig;
  database: Database;
  parserOptions = {
    /**
     * locator is always need for error position info
     */
    locator:{},
    /**
     * you can override the errorHandler for xml parser
     * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
     */
    errorHandler:{warning: () => {}, error: () => {}, fatalError: () => {}}
    //only callback model
    //errorHandler:function(level,msg){console.log(level,msg)}
  };

  constructor(config: ScannerConfig) {
    this.database = new Database();
    this.config = config;
  }

  async connectDatabase() {
    await this.database.connect();
  }

  private async scanMangas() {
    const response = await axios.get(this.config.mangasListUrl);

    const doc = new DOMParser(this.parserOptions).parseFromString(response.data);

    const mangasEncloseNodes = xpath.select(this.config.mangaEnclosingXpath, doc);

    for (const node of mangasEncloseNodes) {
      const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);
      const nodeLink = xpath.select1(this.config.mangaLinkRelativeXpath, parsedNode);
      const name = xpath.select1(this.config.mangaNameRelativeXpath, parsedNode);

      const [manga, source] = await this.searchOrCreate(name.nodeValue, nodeLink.value);
      this.scanManga(manga, source);
    }
  }

  private async scanManga(manga: Manga, source: ScanSource) {
    logger.info(`scanning manga: ${JSON.stringify(manga)} --> ${source.link}`)

    const response = await axios.get(source.link);

    const doc = new DOMParser(this.parserOptions).parseFromString(response.data);
    // logger.debug(`${this.config.chapterEnclosingXpath}`)
    const chaptersEncloseNodes = xpath.select(this.config.chapterEnclosingXpath, doc);

    for (const node of chaptersEncloseNodes) {
      const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);

      const nodeLink = xpath.select1(this.config.chapterLinkRelativeXpath, parsedNode);
      const chapterNumber = xpath.select1(this.config.chapterNumberTextRelativeXpath, parsedNode);
      const name = xpath.select1(this.config.chapterNameRelativeXpath, parsedNode);

      const urlSplit = (nodeLink.value as string).split('/');
      let lastPartUrl = urlSplit[urlSplit.length-1];
      lastPartUrl = lastPartUrl.split('-')[0];
      const chapterN: number = Number(lastPartUrl);

      const [retSource, chapter] = await this.searchOrCreateChapter(source, {
        link: nodeLink.value,
        name: name? name.value : undefined,
        number: chapterN})

      this.scanChapter(retSource, chapter);
    }
  }

  private scanChapter(source: ScanSource, chapter: Chapter) {
  }

  private async searchOrCreate(name: string, link: string): Promise<[Manga, ScanSource]> {
    let [manga, source] = await this.database.findMangaBySourceLink(link);
    logger.debug('manga by link: ', manga);
    if (!manga) {
      manga = await this.database.findMangaByName(name);
      logger.debug('manga by name: ', manga);
      if (!manga) { // create manga
        [manga, source] = await this.database.createManga(name, { name: this.config.name, link: link });
      } else { // add scan source to existing manga
        [manga, source] = await this.database.addScanSourceToManga(manga, { name: this.config.name, link: link })
      }
    }
    return [manga, source];
  }

  private async searchOrCreateChapter(source: ScanSource, chapter: { name: string; link: string; number: number; }): Promise<[ScanSource, Chapter]> {
    let [retSource, retChapter] = await this.database.findChapterByLink(chapter.link);
    if (!retChapter) {
      [retSource, retChapter] = await this.database.addChapterToSource(source, {
        name: chapter.name? chapter.name : null,
        number: chapter.number,
        link: chapter.link
      });
    }

    return [retSource, retChapter]
  }

  scan() {
    // todo
    this.scanMangas();
  }
}
