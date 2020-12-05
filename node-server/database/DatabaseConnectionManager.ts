import { createConnection, ConnectionOptions, getConnection } from 'typeorm';
import { existsSync, readFileSync } from 'fs';

import {
  Manga,
  Tag,
  TagValue,
  ScanSource,
  Chapter,
  ScannerConfig,
  UserProfile,
  Advancement,
  Subscription } from './entity';
import logger from '../logger';

export class DatabaseConnectionManager {

  private constructor() {
    //
  }

  static async getOrCreate(name: string) {
    const opts = DatabaseConnectionManager.getConnectionOptions(name);
    if (opts.type === 'sqlite') {
      try {
        return await createConnection(opts);
      } catch(e) {
        try {
          return getConnection();
        } catch (e) {
          logger.error(`: ${this.constructor.name} -> ${e.message} : ${e.stack}`);
        }
      }
    } else {
      try {
        return await createConnection(opts);
      } catch(e) {
        try {
          return getConnection(opts.name);
        } catch (e) {
          logger.error(`: ${this.constructor.name} -> ${e.message} : ${e.stack}`);
        }
      }
    }
  }

  static getConnectionOptions(name: string): ConnectionOptions {
    const entries = [
      Manga,
      Tag,
      TagValue,
      ScanSource,
      Chapter,
      ScannerConfig,
      UserProfile,
      Advancement,
      Subscription
    ];
    const databaseConfigPath = './data/databaseconfig.json';
    if (existsSync(databaseConfigPath)) {
      const configJSON = readFileSync(databaseConfigPath);
      const config = JSON.parse(configJSON.toString('utf-8'));
      return {
        ...config,
        name,
        entities: entries
      }
    }
    return {
      type: 'sqlite',
      database: './data/database.db',
      synchronize: true,
      entities: entries
    }
  }

}
