import { DOMParser } from 'xmldom';
import * as xpath from 'xpath';
import axios from 'axios';

import logger from '../logger';

import { ScannerConfig, ScanSource } from '../database/entity';
import { UrlUtils } from '../utils/UrlUtils';
import { URL } from 'url';
import { ChapterScannerFactory } from './ChapterScannerFactory';

export class ScannerV2 {
  config: ScannerConfig;
  parserOptions = {
    locator:{},
    errorHandler: {
      warning: (w) => {
        // logger.warn(`${w}`)
      }, error: (e) => {
        // logger.error(`${e}`)
      }, fatalError: (e) => {
        // logger.error(`${e}`)
      }
    }
  };

  constructor(config?: ScannerConfig) {
    this.config = config;
  }

  async listMangas() {
    logger.debug(`Scanner : ${this.config.name} --> list manga from : ${this.config.mangasListUrl}`);
    const response = await axios.get(this.config.mangasListUrl);
    const correctedDoc = '<!doctype html>'.concat(' ',  response.data);
    const doc = new DOMParser(this.parserOptions).parseFromString(correctedDoc);

    let select = null;
    if (doc.documentElement.namespaceURI) {
      select = xpath.useNamespaces({"html": doc.documentElement.namespaceURI});
    } else {
      select = xpath.select;
    }
    const mangasEncloseNodes = select(this.config.mangaEnclosingXpath, doc);
    const mangas: { name: string; link: string; }[] = [];

    for (const node of mangasEncloseNodes) {
      const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);
      const nodeLink = select(this.config.mangaLinkRelativeXpath, parsedNode)[0];
      const name = select(this.config.mangaNameRelativeXpath, parsedNode)[0];
      logger.debug(`Scanner : ${this.config.name} --> manga found : ${name.nodeValue}`);
      mangas.push({
        name: name.nodeValue,
        link: UrlUtils.completeUrl(new URL(this.config.mangasListUrl).origin, nodeLink.value)
      });
    }
    return mangas;
  }

  async scanMangaSource(pSource: ScanSource, scanChaptersPages: boolean) {
    logger.debug(`Scanner : ${this.config.name} --> manga detail from : ${pSource.link}`);
    const response = await axios.get(pSource.link);
    const correctedDoc = '<!doctype html>'.concat(' ',  response.data);

    const doc = new DOMParser(this.parserOptions).parseFromString(correctedDoc);

    let select = null;
    if (doc.documentElement.namespaceURI) {
      select = xpath.useNamespaces({"html": doc.documentElement.namespaceURI});
    } else {
      select = xpath.select;
    }

    const [source, tags] = this.updateScanSource(pSource, doc, select);
    const chapters = await this.scanMangaChapters(source, doc, select, scanChaptersPages);
    logger.debug(`Scanner : ${this.config.name} --> manga ${pSource.manga.name} chapters : ${chapters.length}`);
    source.chapters = chapters;

    return [source, tags];
  }

  private updateScanSource(source: ScanSource, doc: any, select: any): [ScanSource, string[]] {
    // get manga cover
    if (!source.coverLink && this.config.mangaCoverXpath) {
      const coverImage = select(this.config.mangaCoverXpath, doc)[0];
      if (coverImage) {
        logger.debug(`Scanner : ${this.config.name} --> manga ${source.manga.name} find cover : ${coverImage.value}`);
        const coverUri = UrlUtils.imgLinkCleanup(coverImage.value);
        source.coverLink = coverUri;
      }
      // TODO: download cover...
    }
    // get manga description
    if (!source.description && this.config.mangaDescriptionXpath) {
      const descriptionNode = select(this.config.mangaDescriptionXpath, doc)[0];
      if (descriptionNode) {
        logger.debug(`Scanner : ${this.config.name} --> manga ${source.manga.name} find desc : ${descriptionNode.nodeValue}`);
        source.description = descriptionNode.nodeValue;
      }
    }

    const tags: string[] = [];
    // manga genders
    if (this.config.mangaCategoriesXpath && this.config.mangaCategoriesXpath !== '') {
      const genderNodes = select(this.config.mangaCategoriesXpath, doc);
      for (const genderNode of genderNodes) {
        logger.debug(`Scanner : ${this.config.name} --> manga ${source.manga.name} find gender : ${genderNode.nodeValue}`);
        // TODO: cleanup value...
        tags.push(genderNode.nodeValue);
      }
    }
    // get manga tags
    if (this.config.mangaTagsXpath && this.config.mangaTagsXpath !== '') {
      const tagNodes = select(this.config.mangaTagsXpath, doc);
      for (const tagNode of tagNodes) {
        logger.debug(`Scanner : ${this.config.name} --> manga ${source.manga.name} find tags : ${tagNode.nodeValue}`);
        // TODO: cleanup value...
        tags.push(tagNode.nodeValue);
      }
    }

    return [source, tags];
  }

  private async scanMangaChapters(source: ScanSource, doc: any, select: any, scanPages: boolean) {
    const chaptersEncloseNodes = select(this.config.chapterEnclosingXpath, doc);

    const chapters = [];
    for (const node of chaptersEncloseNodes) {
      const parsedNode = new DOMParser(this.parserOptions).parseFromString(`${node}`);

      const nodeLink = select(this.config.chapterLinkRelativeXpath, parsedNode)[0];
      // TODO: find utility
      // const chapterNumber = xpath.select1(this.config.chapterNumberTextRelativeXpath, parsedNode);
      let name;
      if (this.config.chapterNameRelativeXpath) {
        name = select(this.config.chapterNameRelativeXpath, parsedNode)[0];
      }

      const chapterN = this.findChapterNumberFromUrl(nodeLink.value as string);
      logger.debug(`Scanner : ${this.config.name} --> manga ${source.manga.name} find chapter : ${nodeLink.value}`);
      logger.debug(`${source.manga.name} - ${source.name} --> chapter number: ${chapterN}`);

      if (Number.isNaN(chapterN)) {
        logger.warn(`scanning : ${source.manga.name} - ${source.name} --> ${chapterN}`);
      } else {
        chapters.push({
          link: UrlUtils.completeUrl(new URL(this.config.mangasListUrl).origin, nodeLink.value),
          name: name? name.nodeValue : undefined,
          number: chapterN
        });
      }
    }

    // scan chapters pages
    logger.debug(`Scanner : ${this.config.name} --> ${source.manga.name} --> found ${chapters.length} chapters - in source ${source.name}`);
    if (scanPages) {
      for (const chapter of chapters) {
        const scanner = ChapterScannerFactory.from(chapter.link);
        const pages = await scanner.scan(chapter.link);
        chapter.pages = pages;
      }
    }

    return chapters;
  }

  // TODO: parameterize
  private findChapterNumberFromUrl(pUrl: string) {
    const url = new URL(pUrl);
    const urlSplit = url.pathname.split('/');
    let lastPartUrl: string;
    let cLastPartUrl: string;
    let chapterN: number;
    switch(url.host) {
      case 'lel.lecercleduscan.com':
        lastPartUrl = urlSplit[5];
        cLastPartUrl = UrlUtils.chapterCleanup(lastPartUrl);
        chapterN = Number(cLastPartUrl);
        break;
      case 'lel.koneko-scantrad.fr':
        lastPartUrl = urlSplit[urlSplit.length-2];
        cLastPartUrl = UrlUtils.chapterCleanup(lastPartUrl);
        chapterN = Number(cLastPartUrl);
        break;
      default:
        lastPartUrl = urlSplit[urlSplit.length-1];
        const fLastPart = lastPartUrl.split('-')[0];
        const lLastPart = lastPartUrl.split('-')[1];
        cLastPartUrl = UrlUtils.chapterCleanup(fLastPart);
        chapterN = Number(cLastPartUrl);
        if (Number.isNaN(chapterN)) {
          cLastPartUrl = UrlUtils.chapterCleanup(lLastPart);
          chapterN = Number(cLastPartUrl);
        }
        if (Number.isNaN(chapterN)) {
          logger.warn(`chapterN to be found --> ${lastPartUrl}`);
        }
        break;
    }
    return chapterN;
  }

}
