import fs from 'fs';
import path from 'path';
import walkSync from 'walk-sync';

import { Database } from '../database/Database';
import { ScannerConfig, Chapter, ScanSource, Manga } from '../database/entity';
import logger from '../logger';
import { scanAndStore, scanSiteAndStoreFavorites, scanChapterPages } from './scanner-store';

export function scanAllSites() {
  // get all configuration on a new connection...
  logger.info('start scanning all sites')
  const db = new Database();
  db.connect('site-scanner').then( async () => {
    const configs = await db.allConfigs();
    for (const scanerConfig of configs) {
      scanAndStore(scanerConfig);
    }
    db.connection.close();
    logger.debug('close site-scanner connection');
  }).catch(e => {
    logger.error(`: scanAllSites -> ${e.message} : ${e.stack}`);
  });
}

export function scanFavoritesAllSite() {
  logger.info('start scanning favorites sites')
  const db = new Database();
  db.connect('site-scanner').then( async () => {
    const configs = await db.allConfigs();
    for (const scanerConfig of configs) {
      scanSiteAndStoreFavorites(scanerConfig);
    }
    db.connection.close();
    logger.debug('close site-scanner connection');
  }).catch(e => {
    logger.error(`: scanAllSites -> ${e.message} : ${e.stack}`);
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

export function scanfavoritesPages() {
  logger.info('start scanning favorites chapters')
  const db = new Database();
  db.connect('manga-favorit-page-scanner').then( async () => {
    const profiles = await db.userProfileRepository.find({
      relations: [ 'favorites' ]
    });
    const favs = [];
    for (const p of profiles) {
      favs.push(... p.favorites);
    }
    if (favs.length > 0) {
      scanMangaPages(favs.map(f => f.id));
    }
  }).catch(e => {
    logger.error(`: scanfavoritesPages -> ${e.message} : ${e.stack}`);
  });
}

export function scanMangaPages(mangaIds: string[]) {
  const db = new Database();
  db.connect('manga-page-scanner').then( async () => {
    const toScanChapters = await db.connection.createQueryBuilder(Chapter, 'chapter')
          .innerJoin(ScanSource, 'source', 'source.id = chapter."sourceId"')
          .innerJoin(Manga, 'manga', 'source."mangaId" = manga.id')
          .where('scanned = false')
          .andWhere( 'manga.id IN (:...ids)', { ids: mangaIds } )
          .getMany();
    scanChapterPages(toScanChapters);
  }).catch(e => {
    logger.error(`: scanMangaPages -> ${e.message} : ${e.stack}`);
  });
}
