import {  walkSync, readJsonSync } from "https://deno.land/std/fs/mod.ts";

interface SiteScanConfig {
  name: string;

  mangasUrl: string;

  pagination: boolean;
  paginationXpath: string;

  mangaLinkXpath: string;
  mangaNameXpath: string;
}

export function scanAllSite() {
  const configs =  walkSync("./configs");

  for (const scanerConfig of configs) {
    console.log(scanerConfig);
    if (scanerConfig.isFile) {
      const siteConfig = readJsonSync(scanerConfig.path) as SiteScanConfig;
      const scanner = new Scanner(siteConfig);
      scanner.scan();
    }
  }
}

export class Scanner {
  config: SiteScanConfig;
  constructor(config: SiteScanConfig) {
    this.config = config;
  }

  private scanMangas() {
    this.config.mangasUrl
    this.config.pagination
    this.config.paginationXpath

    this.config.mangaLinkXpath
    this.config.mangaNameXpath
  }

  private scanManga() {

  }

  private scanChapter() {

  }

  scan() {
    // todo
  }
}