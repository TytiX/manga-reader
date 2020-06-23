import { Router } from "express";

import { Database } from "../database/Database";
import { getDefaultConfigs } from "../scanners/site-scanner";
import { Scanner } from "../scanners/Scanner";

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
  router.get('/:id', async function(req, res) {
    res.send(await db.findScanConfigById(req.params.id));
  });
  router.delete('/:id', async function(req, res) {
    res.send(await db.deleteConfig(req.params.id));
  });
  router.post('/', async function(req, res) {
    const config = await db.createOrUpdateScanConfig(req.body)
    const scanner = new Scanner(db, config);
    scanner.scanMangas(true);
    res.send(config);
  });

  return router;
}
