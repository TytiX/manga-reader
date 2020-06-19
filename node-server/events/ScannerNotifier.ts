import { Database } from "../database/Database";
import { ScanSource, Chapter, Manga, ScannerConfig } from "../database/entity";
import { WebpushUtils } from "../utils/WebpushUtils";
import { scanChapter } from "../scanners/site-scanner";
import logger from "../logger";
import PQueue from "p-queue/dist";
import * as Discord from 'discord.js';
import { DiscordUtils } from "../utils/DiscordUtils";

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

  messageQueue: PQueue;
  dClient: Discord.Client;

  constructor(db: Database) {
    this.db = db;
    // queue
    this.messageQueue = new PQueue({
      concurrency: 1,
      autoStart: false
    });
    // Discord
    this.dClient = new Discord.Client();
    this.dClient.on('ready', async () => {
      // console.log(this.dClient.channels);
      this.messageQueue.start();
    });
    this.dClient.login(DiscordUtils.getToken());
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
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`Nouveau chapitre de ${source.manga.name}`)
        .setDescription(`Chapitre ${chapter.number} disponible`)
        .setImage(source.coverLink)
        .setURL(`http://172.22.22.52:3000/#/manga/${source.manga.id}`);
    this.messageQueue.add(() => this.sendNotificationMessage(DiscordUtils.ALL_UPDATE_CHANNEL_ID, embed));

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
        if (profile.name === 'TytiX') {
          const find = profile.favorites.find( m => {
            return source.manga.id === m.id;
          });
          if (find) {
            for (const subscription of profile.subscriptions) {
              WebpushUtils.getWebpush().sendNotification(JSON.parse(subscription.jsonData), payloads);
            }
            this.messageQueue.add(() => this.sendNotificationMessage(DiscordUtils.MY_UPDATE_CHANNEL_ID, embed));
            scanChapter(this.db, chapter.id);
          }
        }
      }
    } catch(e) {
      logger.error(e);
    }
  }

  newMangaSource(manga: Manga, source: ScanSource) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`Nouvelle source de ${source.manga.name}`)
        .setDescription(`Source ${source.name} disponible`)
        .setImage(source.coverLink)
        .setURL(`http://172.22.22.52:3000/#/manga/${source.manga.id}`);
    this.messageQueue.add(() => this.sendNotificationMessage(DiscordUtils.ALL_UPDATE_CHANNEL_ID, embed));
  }

  newManga(manga: Manga) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`Nouveau Manga : ${manga.name}`)
        .setURL(`http://172.22.22.52:3000/#/manga/${manga.id}`);
    this.messageQueue.add(() => this.sendNotificationMessage(DiscordUtils.ALL_UPDATE_CHANNEL_ID, embed));
  }

  chapterScanFinish(chapter: Chapter) {
  }

  scanComplete(config: ScannerConfig) {
  }

  progress(progress: number, length: number) {
  }

  async sendNotificationMessage(channelId: string, embed: Discord.MessageEmbed) {
    const channel = await this.dClient.channels.fetch(channelId);
    if (channel) {
      channel.send(embed);
    }
  }

}
