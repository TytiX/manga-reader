import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import moment from 'moment';
import logger from '../logger';

const CACHE_DIR = path.join('.', 'data', 'tmp');

class CacheManager {
  cleanup;

  constructor() {
    this.cleanup = cron.schedule('0 5 * * *', this.dailyCleanup.bind(this));
    this.cleanup.start();
  }

  exists(url: string): boolean {
    return fs.existsSync(this.pathFrom(url));
  }

  get(url: string): Readable {
    logger.debug(`get file from cache --> ${url}`);
    return fs.createReadStream(this.pathFrom(url));
  }

  put(url: string, stream: Readable) {
    if (stream.readableLength > 0) {
      logger.debug(`write file to cache --> ${url}`);
      const file = fs.createWriteStream(this.pathFrom(url));
      stream.pipe(file);
    }
  }

  dailyCleanup() {
    fs.readdirSync(CACHE_DIR).forEach( file => {
      const stat = fs.statSync(path.join(CACHE_DIR, file));
      const da = moment.duration( moment().diff(moment(stat.atime)) );
      const dm = moment.duration( moment().diff(moment(stat.mtime)) );
      logger.debug(`scan file --> ${file} : last access: ${da.humanize()} -- last modified: ${dm.humanize()} -- is cover: ${file.indexOf('cover') != -1}`);
      // Cover files should leave longer in cache...
      if (file.indexOf('cover') != -1 && dm.months() > 1) {
        fs.rmSync(path.join(CACHE_DIR, file));
      } else if (da.days() > 7 || dm.days() > 7) { // Standard files cached ... image
        fs.rmSync(path.join(CACHE_DIR, file));
      }
    });
  }

  pathFrom(url: string) {
    const key = encodeURIComponent(url);
    return path.join(CACHE_DIR, key);
  }
}

export default new CacheManager();
