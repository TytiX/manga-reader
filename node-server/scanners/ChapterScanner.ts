import { DOMParser } from 'xmldom';
import xpath from 'xpath';

import { http } from '../utils/Http';
import logger from '../logger';

import { Page } from '../database/entity';
import { UrlUtils } from '../utils/UrlUtils';

export interface ChapterScanner {
  scan(chapterLink: string);
}

export abstract class AbstractChapterScanner implements ChapterScanner {
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

  async scan(chapterLink: string) {
    let foundPage = true;
    let currentPage = 1;
    const pages: Page[] = [];
    logger.info(`scan chapter from link : ${chapterLink}`);
    // iterate over pages until not found
    do {
      try {
        logger.debug(`scanning page : ${this.constructPageUrl(chapterLink, currentPage)}`);
        const response = await http.get(this.constructPageUrl(chapterLink, currentPage));
        const doc = new DOMParser(this.parserOptions).parseFromString(response);

        let nodeImageLink = this.findImageLinkNode(doc);

        if (nodeImageLink) {
          const imgLink = UrlUtils.imgLinkCleanup(nodeImageLink.value);
          logger.debug(`page link found : ${imgLink}`);
          if (pages.length > 0 && pages[pages.length-1].url === imgLink) {
            foundPage = false;
          } else {
            pages.push({
              number: currentPage,
              url: imgLink
            })
          }
          currentPage++;
        } else {
          foundPage = false;
        }
      } catch (e) {
        foundPage = false;
        logger.error(`: ${this.constructor.name} -> ${e.message} : ${e.stack}`);
      }
    } while(foundPage);
    logger.info(`chapter scan return ${pages.length} pages`);
    return pages;
  }

  abstract constructPageUrl(chapterLink: string, currentPage: number);
  abstract findImageLinkNode(doc);
}

export class DefaultChapterScanner extends AbstractChapterScanner {
  constructPageUrl(chapterLink: string, currentPage: number) {
    return chapterLink + '/' + currentPage;
  }
  findImageLinkNode(doc: any) {
    const select = xpath.select;
    return select('//*[@id=\'ppp\']/a/img/@src', doc)[0];
  }
}

export class NamespaceChapterScanner extends DefaultChapterScanner {
  findImageLinkNode(doc: any) {
    const select = xpath.useNamespaces({"html": doc.documentElement.namespaceURI});
    return select('//html:img[@id="img"]/@src', doc)[0];
  }
}

export class LeCercleDuScanChapterScanner implements ChapterScanner {
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

  async scan(chapterLink: string) {
    const pages: Page[] = [];
    logger.info(`scan chapter from link : ${chapterLink}`);
    try {
      const response = await http.get(chapterLink);
      const doc = new DOMParser(this.parserOptions).parseFromString(response);
      const select = xpath.select;
      const pagesUrl = select('//*[@id="page"]/div/a/img', doc);
      logger.debug(`page link found : ${pagesUrl}`);
      pages.push(
        ... pagesUrl.map(
          (n, index: number) => {
            return {
              number: index+1,
              url: n.attrs.value
            };
          }
        )
      );
    } catch (e) {
      logger.error(`: ${this.constructor.name} -> ${e.message} : ${e.stack}`);
    }
    logger.info(`chapter scan return ${pages.length} pages`);
    return pages;
  }
  
}

export class KonekoChapterScanner extends AbstractChapterScanner {
  constructPageUrl(chapterLink: string, currentPage: number) {
    return chapterLink + '/page/' + currentPage;
  }
  findImageLinkNode(doc: any) {
    const select = xpath.select;
    return select('/html/body/div[1]/article/div[2]/div/a/img/@src', doc)[0];
  }
}

export class UnionChapterScanner extends DefaultChapterScanner {
  
}

export class ScantradChapterScanner extends DefaultChapterScanner {
  
}
