import { Database } from '../database/Database';
import { ScanSource, Chapter, Manga, ScannerConfig } from '../database/entity';
import { WebpushUtils } from '../utils/WebpushUtils';
import logger from '../logger';
import PQueue from 'p-queue/dist';
import * as Discord from 'discord.js';
import { DiscordUtils } from '../utils/DiscordUtils';

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
      this.messageQueue.start();
    });
    const token = DiscordUtils.getToken();
    if (token) {
      this.dClient.login(token);
    }
  }

  async newChapterNotif(source: ScanSource, chapter: Chapter) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`Chapitre ${chapter.number} de ${source.manga.name}`)
        .setDescription(`Nouveau chapitre n°${chapter.number} disponible sur ${source.name}`)
        .setImage(source.coverLink)
        .setURL(`${DiscordUtils.MANGA_URL}/${source.manga.id}`);
    this.messageQueue.add(() => this.sendNotificationMessage(DiscordUtils.ALL_UPDATE_CHANNEL_ID, embed));

    let scanPages = false;
    try {
      const profiles = await this.db.userProfileRepository.find({
        relations: [ 'favorites', 'subscriptions' ]
      });
      const payloads = {
        title: `Chapitre ${chapter.number} de ${source.manga.name}`,
        body: `Nouveau chapitre n°${chapter.number} disponible sur ${source.name}`,
        icon: source.coverLink,
        data: {
          source,
          chapter
        }
      };
      for (const profile of profiles) {
        const channelId = DiscordUtils.findIdByName(this.dClient, profile.name);

        const find = profile.favorites.find( m => source.manga.id === m.id );
        if (find) {
          for (const subscription of profile.subscriptions) {
            WebpushUtils.getWebpush().sendNotification(JSON.parse(subscription.jsonData), payloads);
          }
          if (channelId) this.messageQueue.add(() => this.sendNotificationMessage(channelId, embed));
          scanPages = true;
        }
      }
    } catch(e) {
      logger.error(`${e}`);
    }
    return scanPages;
  }

  newMangaSource(manga: Manga, source: ScanSource) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`Nouvelle source de ${source.manga.name}`)
        .setDescription(`Source ${source.name} disponible`)
        .setImage(source.coverLink)
        .setURL(`${DiscordUtils.MANGA_URL}/${source.manga.id}`);
    this.messageQueue.add(() => this.sendNotificationMessage(DiscordUtils.ALL_UPDATE_CHANNEL_ID, embed));
  }

  newManga(manga: Manga) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`Nouveau Manga : ${manga.name}`)
        .setURL(`${DiscordUtils.MANGA_URL}/${manga.id}`);
    this.messageQueue.add(() => this.sendNotificationMessage(DiscordUtils.ALL_UPDATE_CHANNEL_ID, embed));
  }

  chapterScanFinish(chapter: Chapter) {
  }

  scanComplete(config: ScannerConfig) {
  }

  progress(progress: number, length: number) {
  }

  async sendNotificationMessage(channelId: string, embed: Discord.MessageEmbed) {
    try {
      const channel = await this.dClient.channels.fetch(channelId);
      if (channel) {
        (channel as any).send(embed);
      }
    } catch(e) {
      logger.error(`${e}`);
    }
  }

}
