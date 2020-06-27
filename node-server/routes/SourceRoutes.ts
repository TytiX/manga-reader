import { Router } from 'express';

import { Database } from '../database/Database';

export default (db: Database) => {
  const router = Router();

  router.get('/orflans', async function(req, res) {
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
    res.send(
      await db.findSourceById(req.params.id)
    );
  });
  router.post('/:id/readmode', async function(req, res) {
    res.send(
      await db.updateReadMode(req.params.id, req.body.mode)
    );
  });

  return router;
}
