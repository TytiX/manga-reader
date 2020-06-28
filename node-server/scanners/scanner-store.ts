import { ScannerConfig, Manga, ScanSource, Chapter } from '../database/entity';
import { ScannerV2 } from './ScannerV2';
import PQueue from 'p-queue/dist';
import { Database } from '../database/Database';
import logger from '../logger';
import { ScannerNotifier } from '../events/ScannerNotifier';

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
    logger.error(`${e}`);
  });

  try {
    const notifier = new ScannerNotifier(db);
    const startTime = new Date().getTime();
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
      // logger.info('scanned manga : ', source, tags);
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
        logger.info(`config scann finished ${config.name} in : ${(new Date().getTime() - startTime) / 1000}s`)
      }
    });
  } catch(e) {
    logger.error(`${e}`);
  }
}

async function createOrUpdate(database: Database, notifier: ScannerNotifier, source: ScanSource, tags: string[]) {
  try {
    const dbSource = await retrieveSource(database, notifier, source);
    logger.info(`source updated : ${dbSource.manga.name}`);
    await updateOrAddChapter(database, notifier, dbSource, source.chapters);
    logger.info(`chapters updated : ${dbSource.manga.name}`);
    await updateTags(database, source.manga, tags);
    logger.info(`tags updated : ${dbSource.manga.name}`);
  } catch (e) {
    console.warn(e);
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
  // TODO: add config
  const scanner = new ScannerV2();
  const scanQueue = new PQueue({
    concurrency: 10
  })
  try {
    const db = new Database();
    db.connect('chapter-scanner').then( async () => {
      const notifier = new ScannerNotifier(db);
    
      for (const chapter of chapters) {
        const dbChapter = await db.findChapterById(chapter.id);
        if (dbChapter) {
          await scanPagesAndUpdateChapter(db, scanner, notifier, dbChapter);
        } else {
          logger.warn(`chapter not found: ${chapter.link}`);
        }
      }
    });
  } catch (e) {
    logger.error(`${e}`);
  }
}

/**
 * Launch page scanner and update chapter with pages as JSON
 * @param database the connected database
 * @param scanner the scanner
 * @param chapter the chapter to scan
 */
async function scanPagesAndUpdateChapter(database: Database, scanner: ScannerV2, notifier: ScannerNotifier, chapter: Chapter) {
  const pages = await scanner.scanPages(chapter.link);
  chapter.pages = pages;
  chapter.scanned = true;
  await database.chapterRepository.save(chapter);
  notifier.chapterScanFinish(chapter);
}