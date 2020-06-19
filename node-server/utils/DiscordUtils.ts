import * as fs from "fs";

export class DiscordUtils {

  static readonly ALL_UPDATE_CHANNEL_ID = '723537295206121532';
  static readonly MY_UPDATE_CHANNEL_ID = '723539314352324608'

  static getToken() {
    const key = fs.readFileSync('./data/discordkey');
    return key.toString();
  }

}