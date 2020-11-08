import { ScannerConfig, Manga, ScanSource, Chapter } from '../database/entity';
import { ScannerV2 } from './ScannerV2';
import PQueue from 'p-queue/dist';
import * as moment from 'moment';

import { Database } from '../database/Database';
import logger from '../logger';
import { ScannerNotifier } from '../events/ScannerNotifier';
import { ChapterScannerFactory } from './ChapterScannerFactory';

/**
 * Scan a configuration and Store in the database
 * @param config the configuration to scan
 */
export async function scanAndStore(config: ScannerConfig) {
  const scanner = new ScannerV2(config);

  const storageQueue = new PQueue({
    concurrency: 1,
    autoStart: false
  });
  const db = new Database();
  db.connect(config.name).then( () => {
    storageQueue.start();
  }).catch(e => {
    logger.error(`: scanAndStore -> ${e}`);
  });

  try {
    const notifier = new ScannerNotifier(db);
    const startTime = moment();
    const mangas = await scanner.listMangas();

    for (const manga of mangas) {
      const m = new Manga();
      m.name = manga.name;
      const s = new ScanSource();
      s.name = config.name;
      s.scannerConfig = config;
      s.link = manga.link;
      s.manga = m;
      const [source, tags] = await scanner.scanMangaSource(s, false);
      logger.debug('scanned manga : ', source, tags);
      storageQueue.add( () => createOrUpdate(
        db,
        notifier,
        source as ScanSource,
        tags as string[])
      );
    }

    // close after usage
    storageQueue.onEmpty().then( () => {
      if ( db.connection ) {
        db.connection.close();
        logger.info(`config scan finished ${config.name} in : ${moment.duration(moment().diff(startTime)).humanize()}`);
      }
    }).catch(e => {
      logger.error(`: scanAndStore -> ${e}`);
    });
  } catch(e) {
    logger.error(`: scanAndStore -> ${e}`);
  }
}

async function createOrUpdate(database: Database, notifier: ScannerNotifier, source: ScanSource, tags: string[]) {
  try {
    const dbSource = await retrieveSource(database, notifier, source);
    logger.debug(`source updated : ${dbSource.manga.name}`);
    await updateOrAddChapter(database, notifier, dbSource, source.chapters);
    logger.debug(`chapters updated : ${dbSource.manga.name}`);
    await updateTags(database, dbSource.manga, tags);
    logger.debug(`tags updated : ${dbSource.manga.name}`);
  } catch (e) {
    console.warn(`${e}`);
  }
}

/**
 * Get or create the source
 * @param database current connected database
 * @param source source to retrieve
 */
async function retrieveSource(database: Database, notifier: ScannerNotifier, source: ScanSource) {
  // retreave source
  let dbSource = await database.findSourceByLink(source.link);
  if (!dbSource) {
    const dbManga = await database.findMangaByName(source.manga.name);
    if (dbManga) {
      dbSource = await database.addSourceToManga(dbManga, source);
      notifier.newMangaSource(dbManga, dbSource);
    } else {
      dbSource = await database.createMangaAndSource(source);
      notifier.newManga(dbSource.manga);
    }
  } else {
    // source.id = dbSource.id;
    dbSource.coverLink = source.coverLink;
    dbSource.description = source.description;
    dbSource = await database.updateScanSource(dbSource);
  }
  return dbSource;
}

async function updateOrAddChapter(database: Database, notifier: ScannerNotifier, source: ScanSource, chapters: Chapter[]) {
  for (const chapter of chapters) {
    let dbChapter = await database.findChapterByLink(chapter.link);
    if (!dbChapter) {
      dbChapter = await database.addChapterToSource(source, chapter);
      // send update...
      const scanPages = await notifier.newChapterNotif(source, dbChapter);
      if (scanPages) {
        await scanChapterPages([dbChapter]);
      }
    }
  }
}

/**
 * Update tags values in manga
 * @param database current connected database
 * @param manga manga to update
 * @param tags tag value list
 */
async function updateTags(database: Database, manga: Manga, tags: string[]) {
  await database.associateMangaWithTags(manga, tags);
}

/**
 * Parse pages for specified chapters
 * @param chapters chapters to parse
 */
export async function scanChapterPages(chapters: Chapter[]) {
  // add config
  const scanQueue = new PQueue({ concurrency: 10 });
  try {
    const db = new Database();
    db.connect('chapter-scanner').then( async () => {
      const notifier = new ScannerNotifier(db);
      for (const chapter of chapters) {
        const dbChapter = await db.findChapterById(chapter.id);
        if (dbChapter) {
          scanQueue.add( () => scanPagesAndUpdateChapter(db, notifier, dbChapter) );
        } else {
          logger.warn(`chapter not found: ${chapter.link}`);
        }
      }
      scanQueue.start();
    });
  } catch (e) {
    logger.error(`: scanChapterPages -> ${e}`);
  }
}

/**
 * Launch page scanner and update chapter with pages as JSON
 * @param database the connected database
 * @param scanner the scanner
 * @param chapter the chapter to scan
 */
async function scanPagesAndUpdateChapter(database: Database, notifier: ScannerNotifier, chapter: Chapter) {
  const scanner = ChapterScannerFactory.from(chapter.link);
  const pages = await scanner.scan(chapter.link);
  chapter.pages = pages;
  chapter.scanned = true;
  await database.chapterRepository.save(chapter);
  notifier.chapterScanFinish(chapter);
}
