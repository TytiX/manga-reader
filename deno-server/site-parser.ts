import {  walkSync, readJsonSync } from "https://deno.land/std/fs/mod.ts";

import { Scanner, SiteScanConfig } from "./scanner/Scanner.ts";

export function scanAllSite() {
  const configs =  walkSync("./configs");

  for (const scanerConfig of configs) {
    // console.log(scanerConfig);
    if (scanerConfig.isFile) {
      const siteConfig = readJsonSync(scanerConfig.path) as SiteScanConfig;
      const scanner = new Scanner(siteConfig);
      scanner.scan();
    }
  }
}
