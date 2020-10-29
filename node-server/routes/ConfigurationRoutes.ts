import { Router } from 'express';

import { Database } from '../database/Database';
import { getDefaultConfigs } from '../scanners/site-scanner';
import { ScannerV2 } from '../scanners/ScannerV2';
import { ScanSource, Manga } from '../database/entity';
import { scanAndStore } from '../scanners/scanner-store';
import { ChapterScannerFactory } from '../scanners/ChapterScannerFactory';

export default (db: Database) => {
  const router = Router();
  
  router.get('/', async function(req, res) {
    res.send(await db.allConfigs());
  });
  router.get('/default', async function(req, res) {
    res.send(
      getDefaultConfigs()
    );
  });

  router.post('/test-config', async (req, res) => {
    const scanner = new ScannerV2(req.body);
    const mangas = await scanner.listMangas();
    res.send({
      status: 'ok',
      mangas
    });
  });

  router.post('/test-config/chapterScan', async (req, res) => {
    const scanner = ChapterScannerFactory.from(req.body.link);
    const pages = await scanner.scan(req.body.link);
    res.send({
      status: 'ok',
      pages
    });
  });
  router.post('/test-config/:mangaIndex', async (req, res) => {
    const scanner = new ScannerV2(req.body);
    const mangas = await scanner.listMangas();
    const index = Number(req.params.mangaIndex);
    const m = new Manga();
    m.name = mangas[index].name;
    const s = new ScanSource();
    s.link = mangas[index].link;
    s.manga = m;
    const [source, tags] = await scanner.scanMangaSource(s, false);
    res.send({
      status: 'ok',
      mangas,
      source,
      tags
    });
  });

  router.get('/:id', async function(req, res) {
    res.send(await db.findScanConfigById(req.params.id));
  });
  router.delete('/:id', async function(req, res) {
    res.send(await db.deleteConfig(req.params.id));
  });
  router.post('/', async function(req, res) {
    const config = await db.createOrUpdateScanConfig(req.body);
    scanAndStore(config);
    res.send(config);
  });


  return router;
}
