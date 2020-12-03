// import axios from 'axios';
import { Readable } from 'stream';
import cloudfareScraper from 'cloudflare-scraper';
import logger from '../logger';

export class http {
  static async get(url: string): Promise<any> {
    const response = await cloudfareScraper.get(url);
    return response;
  }
  static async stream(url: string): Promise<any> {
    try {
      let res = await cloudfareScraper.get(url, { encoding: null });
      const buffer = Buffer.from(res, 'binary');
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      return stream;
    }
    catch (e) {
      logger.warn(`stream : ${url} --> ${e.message} : ${e.stack}`);
      const stream = new Readable();
      stream.push(null);
      return stream;
    }
  }
}
