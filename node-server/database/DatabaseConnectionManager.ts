import { createConnection, Connection, ConnectionOptions } from "typeorm";

import {
  Manga,
  Tag,
  TagValue,
  ScanSource,
  Chapter,
  Page,
  ScannerConfig,
  UserProfile,
  Advancement,
  Subscription } from './entity';

export class DatabaseConnectionManager {

  private static connection: Connection;

  private constructor() {
    //
  }

  static async getInstance() {
    if (!DatabaseConnectionManager.connection) {
      return DatabaseConnectionManager.connection = await createConnection(
        DatabaseConnectionManager.getConnectionOptions()
      )
    }
    return DatabaseConnectionManager.connection;
  }

  static async getOrCreate() {
    const opts = DatabaseConnectionManager.getConnectionOptions();
    if (opts.type === 'sqlite') {
      return await DatabaseConnectionManager.getInstance()
    } else {
      return await createConnection(opts);
    }
  }

  static getConnectionOptions(): ConnectionOptions {
    // TODO: postgres - prepare configuration
    return {
      type: 'sqlite',
      database: './data/database.db',
      synchronize: true,
      // logging: true,
      entities: [
        Manga,
        Tag,
        TagValue,
        ScanSource,
        Chapter,
        Page,
        ScannerConfig,
        UserProfile,
        Advancement,
        Subscription
      ]
    }
  }

}
