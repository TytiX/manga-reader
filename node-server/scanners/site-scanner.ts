import * as fs from 'fs';
import * as path from 'path';
import * as walkSync from 'walk-sync';

import { Database } from '../database/Database';
import { ScannerConfig } from '../database/entity';
import { scanAndStore } from './scanner-store';

export default async (firstScan: boolean) => {
  // get all configuration on a new connection...
  const db = new Database();
  db.connect('site-scanner').then( async () => {
    const configs = await db.allConfigs();
    for (const scanerConfig of configs) {
      scanAndStore(scanerConfig);
    }
    db.connection.close();
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
