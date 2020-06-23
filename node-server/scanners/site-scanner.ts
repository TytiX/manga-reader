import * as fs from 'fs';
import * as path from 'path';
import * as walkSync from 'walk-sync';

import { Scanner } from './Scanner';
import { Database } from '../database/Database';
import { ScannerConfig, Chapter } from '../database/entity';

export default async (firstScan: boolean) => {
  // get all configuration on a new connection...
  const db = new Database();
  db.connect().then( async () => {
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
  db.connect().then( async () => {
    for (const chapter of chapters) {
      await scanChapter(db, chapter.id);
    }
  });
}

export async function scanChapter(db: Database, chapterId: string) {
  const scanner = new Scanner(db);

  const chapter = await scanner.database.findChapterById(chapterId);

  await scanner.scanChapter(chapter);
}
