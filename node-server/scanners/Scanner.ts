import { DOMParser } from 'xmldom';
import * as xpath from 'xpath';
import axios from 'axios';
import PQueue from 'p-queue';

import logger from '../logger';
import { Database } from '../database/Database';

import { ScannerConfig, Manga, ScanSource, Chapter } from '../database/entity';
import { UrlUtils } from '../utils/UrlUtils';
import { ScannerNotifier } from '../events/ScannerNotifier';
import { text } from 'body-parser';

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
  queue: PQueue;
  notifier: ScannerNotifier;

  constructor(db: Database, config?: ScannerConfig) {
    this.database = db;
    this.config = config;
    this.queue = new PQueue({concurrency: 100});
    this.notifier = new ScannerNotifier(db);
  }

  async scanMangas(firstScan: boolean) {
    const response = await axios.get(this.config.mangasListUrl);
    const doc = new DOMParser(this.parserOptions).parseFromString(response.data);
    const mangasEncloseNodes = xpath.select(this.config.mangaEnclosingXpath, doc);

    const mangas: { name: string; link: string; }[] = [];

    for (const node of mangasEncloseNodes) {
      const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);
      const nodeLink = xpath.select1(this.config.mangaLinkRelativeXpath, parsedNode);
      const name = xpath.select1(this.config.mangaNameRelativeXpath, parsedNode);
      mangas.push({
        name: name.nodeValue,
        link: nodeLink.value
      });
    }

    logger.info(`Found ${mangas.length} mangas on source - ${this.config.name}`);
    let count = 0;
    this.queue.on('active', () => {
      count ++;
      logger.debug(`Working on item #${count}.  Size: ${this.queue.size}  Pending: ${this.queue.pending}`);
      logger.info(`Scanning advancement ${count}/${mangas.length}.`);
      this.notifier.emit('progress', count, mangas.length);
    });
    this.queue.on('idle', () => {
      logger.info(`Scanning complete: ${this.config.name}`);
      this.notifier.emit('scan complete', this.config);
    });
    for (const m of mangas) {
      this.queue.add(() => this.searchAndScanManga(m, firstScan));
    }
  }

  private async searchAndScanManga(m, firstScan: boolean) {
    try {
      logger.info(`Scanning : ${m.name}`);
      const startTime = new Date().getTime();
      const [manga, source] = await this.searchOrCreate(m.name, m.link);
      await this.scanManga(manga, source, firstScan);
      logger.info(`Scan time : ${manga.name} - ${(new Date().getTime() - startTime) / 1000}s`);
    } catch(e) {
      logger.error(e);
    }
  }

  private async scanManga(manga: Manga, source: ScanSource, firstScan: boolean) {
    const response = await axios.get(source.link);

    const doc = new DOMParser(this.parserOptions).parseFromString(response.data);

    await this.updateScanSource(source, doc, true);

    await this.scanMangaChapters(manga, source, doc, true, firstScan);
  }

  async updateScanSource(source: ScanSource, doc: any, updateTags: boolean) {
    let updated = false;
    // get manga cover
    if (!source.coverLink) {
      const coverImage = xpath.select1(this.config.mangaCoverXpath, doc);
      const coverUri = UrlUtils.imgLinkCleanup(coverImage.value);
      logger.debug(`cover uri: ${coverUri}`);
      source.coverLink = coverUri;
      // TODO: download cover...
      updated = true;
    }
    // get manga description
    if (!source.description) {
      const descriptionNode = xpath.select1(this.config.mangaDescriptionXpath, doc);
      if (descriptionNode) {
        logger.debug(`description: ${descriptionNode.nodeValue}`);
        source.description = descriptionNode.nodeValue;
        updated = true;
      }
    }

    if (updateTags) {
      const tags: string[] = [];
      // manga genders
      if (this.config.mangaCategoriesXpath && this.config.mangaCategoriesXpath !== '') {
        const genderNodes = xpath.select(this.config.mangaCategoriesXpath, doc);
        for (const genderNode of genderNodes) {
          // logger.debug(`gender: ${genderNode.nodeValue}`);
          // TODO: cleanup value...
          tags.push(genderNode.nodeValue);
        }
      }
      // get manga tags
      if (this.config.mangaTagsXpath && this.config.mangaTagsXpath !== '') {
        const tagNodes = xpath.select(this.config.mangaTagsXpath, doc);
        for (const tagNode of tagNodes) {
          // logger.debug(`tags: ${tagNode.nodeValue}`);
          // TODO: cleanup value...
          tags.push(tagNode.nodeValue);
        }
      }

      console.log(source.manga, tags);
      const m = await this.database.associateMangaWithTags(source.manga, tags);
      console.log(m);
    }

    if (updated) {
      await this.database.updateScanSource(source);
    }
  }

  async scanMangaChapters(manga: Manga, source: ScanSource, doc: any, updateChapters: boolean, firstScan: boolean) {
    if (updateChapters) {
      const chaptersEncloseNodes = xpath.select(this.config.chapterEnclosingXpath, doc);

      const chapters = [];
      for (const node of chaptersEncloseNodes) {
        const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);
  
        const nodeLink = xpath.select1(this.config.chapterLinkRelativeXpath, parsedNode);
        const chapterNumber = xpath.select1(this.config.chapterNumberTextRelativeXpath, parsedNode);
        const name = xpath.select1(this.config.chapterNameRelativeXpath, parsedNode);
  
        // TODO: parameterize
        const urlSplit = (nodeLink.value as string).split('/');
        let lastPartUrl = urlSplit[urlSplit.length-1];
        lastPartUrl = lastPartUrl.split('-')[0];
        lastPartUrl = UrlUtils.chapterCleanup(lastPartUrl);
        let chapterN: number = Number(lastPartUrl);

        if (Number.isNaN(chapterN)) {
          lastPartUrl = urlSplit[urlSplit.length-1];
          lastPartUrl = lastPartUrl.split('-')[1];
          lastPartUrl = UrlUtils.chapterCleanup(lastPartUrl);
          chapterN = Number(lastPartUrl);
        }
        logger.debug(`${manga.name} - ${source.name} --> chapter number: ${lastPartUrl}`);
  
        if (Number.isNaN(chapterN)) {
          logger.error(`Error scanning : ${manga.name} - ${source.name} --> ${lastPartUrl}`);
        } else {
          chapters.push({
            link: nodeLink.value,
            name: name? name.nodeValue : undefined,
            number: chapterN
          });
        }
      }

      logger.info(`Found ${chapters.length} chapters --> ${manga.name} - ${source.name}`);
      let count = 0;
      for (const chapter of chapters) {
        await this.searchOrCreateChapter(source, chapter, firstScan);
        logger.info(`Progress: ${++count}/${chapters.length} --> ${manga.name} - ${source.name}`);
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
      const nodeImageLink = xpath.select1('//*[@id=\'ppp\']/a/img/@src', doc);

      if (nodeImageLink) {
        logger.debug(nodeImageLink.value);
        const imgLink = UrlUtils.imgLinkCleanup(nodeImageLink.value);
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
    const dbChapter = await this.database.markChapterAsScanned(chapter.id);
    this.notifier.emit('end parsing chapter', dbChapter);
    logger.info('end parsing chapter');
  }

  private async searchOrCreate(name: string, link: string): Promise<[Manga, ScanSource]> {
    let [manga, source] = await this.database.findMangaBySourceLink(link);
    logger.debug('manga by link: ', manga);
    if (!manga) {
      manga = await this.database.findMangaByName(name);
      logger.debug('manga by name: ', manga);
      if (!manga) { // create manga
        [manga, source] = await this.database.createManga(name, { name: this.config.name, link: link }, this.config);
        this.notifier.emit('create manga', manga);
      } else { // add scan source to existing manga
        [manga, source] = await this.database.addScanSourceToManga(manga, { name: this.config.name, link: link }, this.config);
        this.notifier.emit('add source manga', manga, source);
      }
    }
    return [manga, source];
  }

  private async searchOrCreateChapter(source: ScanSource, chapter: { name: string; link: string; number: number; }, firstScan: boolean): Promise<[ScanSource, Chapter]> {
    let [retSource, retChapter] = await this.database.findChapterByLink(chapter.link);
    logger.debug('chapter by link: ', retChapter);
    if (!retChapter) {
      retSource = await this.database.findSourceById(source.id);
      [retSource, retChapter] = await this.database.addChapterToSource(retSource, {
        name: chapter.name? chapter.name : null,
        number: chapter.number,
        link: chapter.link
      });
      logger.info(`new chapter : ${retSource.manga.name} - ${retChapter.number}`);
      if (!firstScan) {
        this.notifier.emit('new chapter', retSource, retChapter);
      }
    }
    return [retSource, retChapter];
  }
}
