import * as cheerio from 'cheerio';
import axios from 'axios';
import PQueue from 'p-queue';

import logger from '../logger';
import { Database } from '../database/Database';

import { ScannerConfig, Manga, ScanSource, Chapter } from '../database/entity';

export class ScannerCheerio {
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
  queue: PQueue;

  constructor(config: ScannerConfig) {
    this.database = new Database();
    this.config = config;
    this.queue = new PQueue({concurrency: 100});
  }

  async connectDatabase() {
    await this.database.connect();
  }

  private async scanMangas() {
    const response = await axios.get(this.config.mangasListUrl);
    
    const $ = cheerio.load(response.data);
    const mangasEncloseNodes = $('ul.manga-list > li > a');
    logger.warn(mangasEncloseNodes);
    // const mangasEncloseNodes = xpath.select(this.config.mangaEnclosingXpath, doc);

    const mangas: { name: string; link: string; }[] = [];

    // for (const node of mangasEncloseNodes) {
      // const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);
      // const nodeLink = xpath.select1(this.config.mangaLinkRelativeXpath, parsedNode);
      // const name = xpath.select1(this.config.mangaNameRelativeXpath, parsedNode);
      // mangas.push({
      //   name: name.nodeValue,
      //   link: nodeLink.value
      // });
    //   logger.info(node);
    // }

    // logger.info(`Found ${mangas.length} mangas on source - ${this.config.name}`);
    // let count = 0;
    // this.queue.on('active', () => {
    //   logger.debug(`Working on item #${++count}.  Size: ${this.queue.size}  Pending: ${this.queue.pending}`);
    //   logger.info(`Scanning advancement ${(++count) * 100 / mangas.length}%.`);
    // });
    // for (const m of mangas) {
    //   this.queue.add(() => this.searchAndScanManga(m));
    // }
  }

  private async searchAndScanManga(m) {
    try {
      logger.info(`Scanning : ${m.name}`);
      const startTime = new Date().getTime();
      const [manga, source] = await this.searchOrCreate(m.name, m.link);
      await this.scanManga(manga, source);
      logger.info(`Scan time : ${manga.name} - ${(new Date().getTime() - startTime) / 1000}s`);
    } catch(e) {
      logger.error(e);
    }
  }

  private async scanManga(manga: Manga, source: ScanSource) {
    const response = await axios.get(source.link);

    const doc = new DOMParser(this.parserOptions).parseFromString(response.data);

    await this.updateScanSource(source, doc, false);

    await this.scanMangaChapters(manga, source, doc, true);
  }

  async updateScanSource(source: ScanSource, doc: any, updateTags: false) {
    let updated = false;
    // get manga cover
    if (!source.coverLink) {
      const coverImage = xpath.select1('/html/body/div[1]/div/div[1]/div/div[1]/div[1]/div/img/@src', doc);
      const coverUri = coverImage.value.replace('//', 'https://')
      logger.debug(`cover uri: ${coverUri}`);
      source.coverLink = coverUri;
      // TODO: download cover...
      updated = true;
    }
    // get manga description
    if (!source.description) {
      const descriptionNode = xpath.select1('/html/body/div[1]/div/div[1]/div/div[2]/div/div/p/text()', doc);
      if (descriptionNode) {
        logger.debug(`description: ${descriptionNode.nodeValue}`);
        source.description = descriptionNode.nodeValue;
        updated = true;
      }
    }

    if (updateTags) {
      // manga genders
      const genderNodes = xpath.select('/html/body/div[1]/div/div[1]/div/div[1]/div[2]/dl/dd[7]/a/text()', doc);
      for (const genderNode of genderNodes) {
        logger.debug(`gender: ${genderNode.nodeValue}`);
      }
      // get manga tags
      const tagNodes = xpath.select('//dd[@class='tag-links']/a/text()', doc);
      for (const tagNode of tagNodes) {
        logger.debug(`tags: ${tagNode.nodeValue}`);
      }
    }

    if (updated) {
      await this.database.updateScanSource(source);
    }
  }

  async scanMangaChapters(manga: Manga, source: ScanSource, doc: any, updateChapters: boolean) {
    if (updateChapters) {
      const chaptersEncloseNodes = xpath.select(this.config.chapterEnclosingXpath, doc);
  
      for (const node of chaptersEncloseNodes) {
        const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);
  
        const nodeLink = xpath.select1(this.config.chapterLinkRelativeXpath, parsedNode);
        const chapterNumber = xpath.select1(this.config.chapterNumberTextRelativeXpath, parsedNode);
        const name = xpath.select1(this.config.chapterNameRelativeXpath, parsedNode);
  
        // TODO: parameterize
        const urlSplit = (nodeLink.value as string).split('/');
        let lastPartUrl = urlSplit[urlSplit.length-1];
        lastPartUrl = lastPartUrl.split('-')[0];
        lastPartUrl = lastPartUrl.replace(' ', '')
          .replace(',', '.').replace('%20', '')
          .replace('%60', '').replace('%5D', '');
  
        const chapterN: number = Number(lastPartUrl);
        logger.debug(`${manga.name} - ${source.name} --> chapter number: ${lastPartUrl}`);
        logger.debug(`${manga.name} - ${source.name} --> chapter number: ${chapterN}`);
  
        if (Number.isNaN(chapterN)) {
          logger.error(`Error scanning : ${manga.name} - ${source.name} --> ${lastPartUrl}`);
        } else {
          const [retSource, chapter] = await this.searchOrCreateChapter(source, {
            link: nodeLink.value,
            name: name? name.value : undefined,
            number: chapterN});
        }
      }
    }
  }

  // TODO: parametrize
  async scanChapter(chapter: Chapter) {
    let foundPage = true;
    let currentPage = 1;
    const pages: { number: number; url: string; }[] = [];
    // iterate over pages until not found
    do {
      const response = await axios.get(chapter.link + '/' + currentPage);
      
      const doc = new DOMParser(this.parserOptions).parseFromString(response.data);
      const nodeImageLink = xpath.select1('//*[@id='ppp']/a/img/@src', doc);

      if (nodeImageLink) {
        logger.debug(nodeImageLink.value);
        const imgLink = nodeImageLink.value.replace('//', 'https://')
        pages.push({
          number: currentPage,
          url: imgLink
        })
        currentPage++;
      } else {
        foundPage = false;
      }

    } while(foundPage);
    await this.database.addPagesToChapter(chapter.id, pages);
    logger.debug('end parsing chapter');
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
      logger.info(`new chapter : ${retSource.manga.name} - ${retChapter.number}`);
      // TODO: scan chapter for pages
      // this.scanChapter(retSource, retChapter);
    }
    return [retSource, retChapter];
  }

  scan() {
    // todo
    this.scanMangas();
  }
}
