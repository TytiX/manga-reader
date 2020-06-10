import * as fs from 'fs';
import * as path from 'path';
import * as walkSync from 'walk-sync';

import logger from './logger';
import { Scanner } from './scanners/Scanner';

export default async () => {
  const configs =  walkSync.entries('./configs');

  for (const scanerConfig of configs) {
    if (!scanerConfig.isDirectory()) {
      logger.debug(scanerConfig);
      const rawdata = fs.readFileSync(path.join(scanerConfig.basePath, scanerConfig.relativePath));
      let siteConfig = JSON.parse(rawdata);
      const scanner = new Scanner(siteConfig);
      await scanner.connectDatabase();
      scanner.scan();
    }
  }
}
