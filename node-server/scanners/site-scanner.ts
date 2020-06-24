import * as fs from 'fs';
import * as path from 'path';
import * as walkSync from 'walk-sync';
import { DOMParser } from 'xmldom';
import * as xpath from 'xpath';
import axios from 'axios';

import logger from '../logger';
import { UrlUtils } from '../utils/UrlUtils';

import { Scanner } from './Scanner';
import { Database } from '../database/Database';
import { ScannerConfig, Chapter, Page } from '../database/entity';
import { ScannerNotifier } from '../events/ScannerNotifier';

export default async (firstScan: boolean) => {
  // get all configuration on a new connection...
  const db = new Database();
  db.connect('site-scanner').then( async () => {
    const configs = await db.allConfigs();
    for (const scanerConfig of configs) {
      const scanner = new Scanner(scanerConfig);
      scanner.scanMangas(firstScan);
    }
  });
}

export function getDefaultConfigs() {
  const defaultConfigs: ScannerConfig[] = [];
  const configs =  walkSync.entries('./configs');
  for (const scanerConfig of configs) {
    if ( !scanerConfig.isDirectory() ) {
      const rawdata = fs.readFileSync(path.join(scanerConfig.basePath, scanerConfig.relativePath));
      defaultConfigs.push(JSON.parse(rawdata.toString()));
    }
  }
  return defaultConfigs;
}

export async function scanChapters(chapters: Chapter[]) {
  const db = new Database();
  db.connect(chapters[0].id).then( async () => {
    const notifier = new ScannerNotifier(db);
    for (const chapter of chapters) {
      await scanChapter(db, notifier, chapter.id);
    }
  });
}

export async function scanChapter(db: Database, notifier: ScannerNotifier, chapterId: string) {
  const chapter = await db.findChapterById(chapterId);

  let foundPage = true;
  let currentPage = 1;
  const pages: Page[] = [];
  // iterate over pages until not found
  do {
    const response = await axios.get(chapter.link + '/' + currentPage);
    const doc = new DOMParser({
      locator:{},
      errorHandler:{warning: () => {}, error: () => {}, fatalError: () => {}}
    }).parseFromString(response.data);
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

  const dbChapter = await db.addPagesToChapter(chapter.id, pages);
  // const dbChapter = await db.markChapterAsScanned(chapter.id);
  notifier.emit('end parsing chapter', dbChapter);
  logger.info('end parsing chapter');
}
