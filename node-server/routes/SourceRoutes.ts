import { Router } from 'express';

import { Database } from '../database/Database';
import logger from '../logger';

export default (db: Database) => {
  const router = Router();

  router.get('/orflans', async function(req, res) {
    logger.debug(`SourcesAPI --> get orflans manga source`);
    res.send(
      await db.sourceRepository.findAndCount({
        relations: [ 'manga' ],
        where: {
          manga: null
        }
      })
    );
  });
  router.get('/:id', async function(req, res) {
    logger.debug(`SourcesAPI --> get source ${req.params.id}`);
    res.send(
      await db.findSourceById(req.params.id)
    );
  });
  router.post('/:id/readmode', async function(req, res) {
    logger.debug(`SourcesAPI --> change source readmode ${req.params.id} to ${req.body.mode}`);
    res.send(
      await db.updateReadMode(req.params.id, req.body.mode)
    );
  });

  return router;
}
