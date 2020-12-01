import fs from 'fs';
import { Client } from 'discord.js';
import logger from '../logger';

export class DiscordUtils {

  static readonly ALL_UPDATE_CHANNEL_ID = '723537295206121532';
  static readonly MY_UPDATE_CHANNEL_ID = '723559252614185030';

  static readonly MANGA_URL = 'http://172.22.22.52:3000/#/manga';

  static getToken() {
    try {
      const key = fs.readFileSync('./data/discordkey');
      return key.toString();
    } catch (e) {
      logger.error(`: DiscordUtils -> ${e.message} : ${e.stack}`);
      return undefined;
    }
  }

  static findIdByName(client: Client, name: string) {
    const lowName = name.toLowerCase();
    for (const [id, channel] of client.channels.cache.entries()) {
      if ((channel as any).name === lowName) {
        return id;
      }
    }
    return undefined;
  }
}