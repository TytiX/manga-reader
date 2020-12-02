import { Router } from 'express';
import { spawn } from 'child_process';
import walkSync from 'walk-sync';
import cron from 'node-cron';

import { Database } from '../database/Database';
import { getDefaultConfigs } from '../scanners/site-scanner';
import { ScannerV2 } from '../scanners/ScannerV2';
import { ScanSource, Manga } from '../database/entity';
import { scanAndStore } from '../scanners/scanner-store';
import { ChapterScannerFactory } from '../scanners/ChapterScannerFactory';
import logger from '../logger';
import crons from '../crons';

export default (db: Database) => {
  const router = Router();
  
  /****************************** CONFGI *******************************/
  router.get('/', async function(req, res) {
    logger.debug(`ConfigAPI --> get all config`);
    res.send(await db.allConfigs());
  });
  router.get('/default', async function(req, res) {
    res.send(
      getDefaultConfigs()
    );
  });

  /****************************** TEST CONFIGS *******************************/
  router.post('/test-config', async (req, res) => {
    logger.debug(`ConfigAPI --> test config ${req.body}`);
    const scanner = new ScannerV2(req.body);
    const mangas = await scanner.listMangas();
    res.send({
      status: 'ok',
      mangas
    });
  });
  router.post('/test-config/chapterScan', async (req, res) => {
    logger.debug(`ConfigAPI --> test config scan chapter ${req.body.link}`);
    const scanner = ChapterScannerFactory.from(req.body.link);
    const pages = await scanner.scan(req.body.link);
    res.send({
      status: 'ok',
      pages
    });
  });
  router.post('/test-config/:mangaIndex', async (req, res) => {
    logger.debug(`ConfigAPI --> test config scan manga ${req.params.mangaIndex}`);
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

  /****************************** LOGGER *******************************/
  router.get('/logger', (req, res) => {
    logger.debug(`ConfigAPI --> Get all log files`);
    const configs = walkSync.entries('./logs');
    logger.debug(`ConfigAPI --> ${configs}`);
    res.send(configs);
  });
  router.get('/logger/level', (req, res) => {
    logger.debug(`ConfigAPI --> Get logging level`);
    res.send(logger.level);
  });
  router.get('/logger/:level', (req, res) => {
    logger.debug(`ConfigAPI --> Change logging level : ${req.params.level}`);
    logger.level = req.params.level;
    res.send(req.params.level);
  });
  router.get('/tail/:file', (req, res) => {
    logger.debug(`ConfigAPI --> tail file : ${req.params.file}`);
    const tail = spawn('tail', ['-f', `./logs/${req.params.file}`]);
    req.connection.on('end', () => {
      logger.debug(`ConfigAPI --> file end ${req.params.file}`);
      tail.kill();
    });
    tail.stdout.on('data', (line) => {
      logger.debug(`ConfigAPI --> file ${req.params.file} : ${line}`);
      res.write(line);
    });
  });

  /****************************** CRON *******************************/
  router.get('/cron/:what', (req, res) => {
    const what = req.params.what;
    res.send({
      what,
      cron: crons.getExpression(what)
    })
  });
  router.post('/cron/:what', (req, res) => {
    const what = req.params.what;
    const cronExpression = req.body.cron;
    res.send({
      what,
      updated: crons.updateCron(what, cronExpression)
    })
  });
  router.post('/cron/test', (req, res) => {
    const cronExpression = req.body.cron;
    const valid = cron.validate(cronExpression);
    res.send({
      cron: cronExpression,
      valid
    });
  });

  /*************************** CONFIG **********************************/
  router.get('/:id', async function(req, res) {
    logger.debug(`ConfigAPI --> find config ${req.params.id}`);
    res.send(await db.findScanConfigById(req.params.id));
  });
  router.delete('/:id', async function(req, res) {
    logger.debug(`ConfigAPI --> delete config ${req.params.id}`);
    res.send(await db.deleteConfig(req.params.id));
  });
  router.post('/', async function(req, res) {
    logger.debug(`ConfigAPI --> create or update config ${req.body}`);
    const config = await db.createOrUpdateScanConfig(req.body);
    scanAndStore(config);
    res.send(config);
  });

  return router;
}
