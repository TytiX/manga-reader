import { Database } from "../database/Database";
import { ScanSource, Chapter, Manga, ScannerConfig } from "../database/entity";
import { WebpushUtils } from "../utils/WebpushUtils";
import { scanChapter } from "../scanners/site-scanner";
import logger from "../logger";

enum MessageType {
  progress = 'progress',
  scanComplete = 'scan complete',
  endParsingChapter = 'end parsing chapter',
  createManga = 'create manga',
  addMangaSource = 'add source manga',
  newChapter = 'new chapter'
}

export class ScannerNotifier {
  db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  emit(msg: string, ...args: any[]) {
    switch(msg) {
      case MessageType.progress:
        this.progress(args[0], args[1]);
        break;
      case MessageType.scanComplete:
        this.scanComplete(args[0]);
        break;
      case MessageType.endParsingChapter:
        this.chapterScanFinish(args[0]);
        break;
      case MessageType.createManga:
        this.newManga(args[0]);
        break;
      case MessageType.addMangaSource:
        this.newMangaSource(args[0], args[1]);
        break;
      case MessageType.newChapter:
        this.newChapterNotif(args[0], args[1]);
        break;
    }
  }

  async newChapterNotif(source: ScanSource, chapter: Chapter) {
    try {
      const profiles = await this.db.userProfileRepository.find({
        relations: [ 'favorites', 'subsciptions' ]
      });
      const payloads = {
        title: `Nouveau chapitre de ${source.manga.name}`,
        body: `Chapitre ${chapter.number} disponible`,
        icon: source.coverLink,
        data: {
          source,
          chapter
        }
      };
      for (const profile of profiles) {
        const find = profile.favorites.find( m => {
          return source.manga.id === m.id;
        });
        if (find) {
          for (const subscription of profile.subscriptions) {
            WebpushUtils.getWebpush().sendNotification(JSON.parse(subscription.jsonData), payloads);
          }
          scanChapter(this.db, chapter.id);
        }
      }
    } catch(e) {
      logger.error(e);
    }
  }

  newMangaSource(manga: Manga, source: ScanSource) {
  }

  newManga(manga: Manga) {
  }

  chapterScanFinish(chapter: Chapter) {
  }

  scanComplete(config: ScannerConfig) {
  }

  progress(progress: number, length: number) {
  }

}
