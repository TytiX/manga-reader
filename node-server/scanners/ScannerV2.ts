import { DOMParser } from 'xmldom';
import * as xpath from 'xpath';
import axios from 'axios';

import logger from '../logger';

import { ScannerConfig, ScanSource, Page } from '../database/entity';
import { UrlUtils } from '../utils/UrlUtils';
import { URL } from 'url';

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
      mangas.push({
        name: name.nodeValue,
        link: UrlUtils.completeUrl(new URL(this.config.mangasListUrl).origin, nodeLink.value)
      });
    }
    return mangas;
  }

  async scanMangaSource(pSource: ScanSource, scanChaptersPages: boolean) {
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
    source.chapters = chapters;

    return [source, tags];
  }

  private updateScanSource(source: ScanSource, doc: any, select: any): [ScanSource, string[]] {
    // get manga cover
    if (!source.coverLink && this.config.mangaCoverXpath) {
      const coverImage = select(this.config.mangaCoverXpath, doc)[0];
      if (coverImage) {
        const coverUri = UrlUtils.imgLinkCleanup(coverImage.value);
        source.coverLink = coverUri;
      }
      // TODO: download cover...
    }
    // get manga description
    if (!source.description && this.config.mangaDescriptionXpath) {
      const descriptionNode = select(this.config.mangaDescriptionXpath, doc)[0];
      if (descriptionNode) {
        logger.debug(`description: ${descriptionNode.nodeValue}`);
        source.description = descriptionNode.nodeValue;
      }
    }

    const tags: string[] = [];
    // manga genders
    if (this.config.mangaCategoriesXpath && this.config.mangaCategoriesXpath !== '') {
      const genderNodes = select(this.config.mangaCategoriesXpath, doc);
      for (const genderNode of genderNodes) {
        logger.debug(`gender: ${genderNode.nodeValue}`);
        // TODO: cleanup value...
        tags.push(genderNode.nodeValue);
      }
    }
    // get manga tags
    if (this.config.mangaTagsXpath && this.config.mangaTagsXpath !== '') {
      const tagNodes = select(this.config.mangaTagsXpath, doc);
      for (const tagNode of tagNodes) {
        logger.debug(`tags: ${tagNode.nodeValue}`);
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

      const [chapterN, lastPartUrl] = this.findChapterNumberFromUrl(nodeLink.value as string);
      logger.debug(`${source.manga.name} - ${source.name} --> chapter number: ${lastPartUrl}`);

      if (Number.isNaN(chapterN)) {
        logger.error(`Error scanning : ${source.manga.name} - ${source.name} --> ${lastPartUrl}`);
      } else {
        chapters.push({
          link: UrlUtils.completeUrl(new URL(this.config.mangasListUrl).origin, nodeLink.value),
          name: name? name.nodeValue : undefined,
          number: chapterN
        });
      }
    }

    // scan chapters pages
    logger.info(`${source.manga.name} --> found ${chapters.length} chapters - in source ${source.name}`);
    if (scanPages) {
      for (const chapter of chapters) {
        const pages = await this.scanPages(chapter.link);
        chapter.pages = pages;
      }
    }

    return chapters;
  }

  // TODO: parameterize
  private findChapterNumberFromUrl(url: string) {
    const urlSplit = url.split('/');
    let lastPartUrl = urlSplit[urlSplit.length-1];
    lastPartUrl = lastPartUrl.split('-')[0];
    let chapterN: number;
    if (lastPartUrl) {
      lastPartUrl = UrlUtils.chapterCleanup(lastPartUrl);
      chapterN = Number(lastPartUrl);
    }

    if (Number.isNaN(chapterN)) {
      lastPartUrl = urlSplit[urlSplit.length-1];
      lastPartUrl = lastPartUrl.split('-')[1];
      if (lastPartUrl) {
        lastPartUrl = UrlUtils.chapterCleanup(lastPartUrl);
        chapterN = Number(lastPartUrl);
      }
    }
    return [chapterN, lastPartUrl];
  }

  // TODO: parametrize chapter scanner config...
  async scanPages(chapterLink: string) {
    let foundPage = true;
    let currentPage = 1;
    const pages: Page[] = [];
    // iterate over pages until not found
    do {
      try {
        logger.debug(`scanning page : ${chapterLink + '/' + currentPage}`);
        const response = await axios.get(chapterLink + '/' + currentPage);
        const doc = new DOMParser(this.parserOptions).parseFromString(response.data);
  
        let select = null;
        if (doc.documentElement.namespaceURI) {
          select = xpath.useNamespaces({"html": doc.documentElement.namespaceURI});
        } else {
          select = xpath.select;
        }
        const nodeImageLink = select('//*[@id=\'ppp\']/a/img/@src', doc)[0];
        const nodeImageLinkAlt = select('//html:img[@id="img"]/@src', doc)[0];

        if (nodeImageLink) {
          const imgLink = UrlUtils.imgLinkCleanup(nodeImageLink.value);
          pages.push({
            number: currentPage,
            url: imgLink
          })
          currentPage++;
        } else if (nodeImageLinkAlt) {
          const imgLink = UrlUtils.imgLinkCleanup(nodeImageLinkAlt.value);
          pages.push({
            number: currentPage,
            url: imgLink
          })
          currentPage++;
        } else {
          foundPage = false;
        }
      } catch (e) {
        foundPage = false;
        logger.error(`${e}`);
      }
    } while(foundPage);
    return pages;
  }

}
