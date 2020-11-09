import { Router } from 'express';

import { Database } from '../database/Database';
import logger from '../logger';
import { scanMangaPages } from '../scanners/site-scanner';

export default (db: Database) => {
  const router = Router();

  router.get('/', async function(req, res) {
    logger.debug(`UserProfileAPI --> get All profile`);
    res.send(await db.allProfiles());
  });
  router.get('/:id', async function(req, res) {
    logger.debug(`UserProfileAPI --> get profile ${req.params.id}`);
    res.send(await db.findUserProfile(req.params.id));
  });
  router.delete('/:id', async function(req, res) {
    logger.debug(`UserProfileAPI --> delete profile ${req.params.id}`);
    res.send(await db.deleteUserProfile(req.params.id));
  });
  router.post('/', async function(req, res) {
    logger.debug(`UserProfileAPI --> create profile ${req.body}`);
    const profile = await db.createOrUpdateUserProfile(req.body)
    res.send(profile);
  });
  router.get('/:profileId/advancement', async function(req, res) {
    logger.debug(`UserProfileAPI --> get profile advencement ${req.params.profileId}`);
    res.send(
      await db.getAdvancements(
        req.params.profileId
      )
    );
  });
  router.get('/:profileId/advancement/:mangaId', async function(req, res) {
    logger.debug(`UserProfileAPI --> get profile advencement ${req.params.profileId} for manga ${req.params.mangaId}`);
    res.send(
      await db.getAdvancementsForManga(
        req.params.profileId,
        req.params.mangaId
      )
    );
  });
  router.post('/:profileId/advancement', async function(req, res) {
    logger.debug(`UserProfileAPI --> post profile advencement ${req.params.profileId} for manga ${req.body.sourceId}, chapter ${req.body.chapterId}, pagechapterId ${req.body.pageNumber}`);
    await db.updateAdvancement(
      req.params.profileId,
      req.body.sourceId,
      req.body.chapterId,
      req.body.pageNumber
    );
    res.send({status: 'ok'});
  });
  router.post('/:profileId/addfav/:mangaId', async function(req, res) {
    logger.debug(`UserProfileAPI --> post profile favorite ${req.params.profileId} for manga ${req.params.mangaId}`);
    const p = await db.addFavoriteToProfile(
      req.params.profileId,
      req.params.mangaId
    );
    scanMangaPages([req.params.mangaId]);
    res.send( p );
  });
  router.post('/:profileId/rmfav/:mangaId', async function(req, res) {
    logger.debug(`UserProfileAPI --> remove profile favorite ${req.params.profileId} for manga ${req.params.mangaId}`);
    res.send(
      await db.removeFavoriteFromProfile(
        req.params.profileId,
        req.params.mangaId
      )
    );
  });

  // Webpush register
  router.post('/:profileId/subscribe', async function(req, res) {
    let subscription = req.body;
    subscription = await db.saveOrUpdateSubscription(req.params.profileId, subscription);
    res.send(subscription);
  });
  router.post('/:profileId/unsubscribe', async function(req, res) {
    let subscription = req.body;
    subscription = await db.removeSubscription(req.params.profileId, subscription);
    res.send(subscription);
  });

  return router;
}
