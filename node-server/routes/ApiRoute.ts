import { Router } from 'express';
import { Database } from '../database/Database';
import { scanChapter, scanChapters, getDefaultConfigs } from '../scanners/site-scanner';
import { Scanner } from '../scanners/Scanner';
import { WebpushUtils } from '../utils/WebpushUtils';
import { IsNull, In } from 'typeorm';
import { Tag } from '../database/entity/Tag';

export default (db: Database) => {

  const router = Router();

  /***************************************************************************
   * Mangas
   ***************************************************************************/
  router.get('/manga', async function(req, res) {
    res.send(
      await db.allMangas()
    );
  });
  router.post('/manga/search', async function(req, res) {
    res.send(
      await db.mangaByTags(req.body.tags)
    )
  });
  router.get('/manga/:id', async function(req, res) {
    res.send(
      await db.findMangaById(req.params.id)
    );
  });
  /***************************************************************************
   * Sources
   ***************************************************************************/
  router.get('/source/orflans', async function(req, res) {
    res.send(
      await db.sourceRepository.findAndCount({
        relations: [ 'manga' ],
        where: {
          manga: null
        }
      })
    );
  });
  router.get('/source/:id', async function(req, res) {
    res.send(
      await db.findSourceById(req.params.id)
    );
  });
  /***************************************************************************
   * Chapters
   ***************************************************************************/
  router.get('/chapter/orphans', async function(req, res) {
    res.send(
      await db.chapterRepository.findAndCount({
        relations: [ 'source' ],
        where: {
          source: null
        }
      })
    );
  });
  router.delete('/chapter/orphans', async function(req, res) {
    const orphansChapters = await db.chapterRepository.find({
      relations: [ 'source' ],
      where: {
        source: null
      },
      take: 500
    });
    res.send(
      await db.chapterRepository.delete(orphansChapters.map(c => c.id))
    );
  });
  router.get('/chapter/:id', async function(req, res) {
    res.send(
      await db.findChapterById(req.params.id)
    );
  });
  router.get('/chapter/:id/next', async function(req, res) {
    res.send(
      await db.findNextChapterById(req.params.id)
    );
  });
  router.get('/chapter/:id/previous', async function(req, res) {
    res.send(
      await db.findPreviousChapterById(req.params.id)
    );
  });
  router.post('/chapter', async function(req, res) {
    res.send(
      await db.findChapterByLink((req.body as any).link)
    );
  });
  router.post('/chapter/scan', async function(req, res) {
    scanChapters(db, req.body);
    res.send({
      status: 'running'
    });
  });

  /***************************************************************************
   * Configurations
   ***************************************************************************/
  router.get('/configuration', async function(req, res) {
    res.send(await db.allConfigs());
  });
  router.get('/configuration/:id', async function(req, res) {
    res.send(await db.findScanConfigById(req.params.id));
  });
  router.delete('/configuration/:id', async function(req, res) {
    res.send(await db.deleteConfig(req.params.id));
  });
  router.post('/configuration', async function(req, res) {
    const config = await db.createOrUpdateScanConfig(req.body)
    const scanner = new Scanner(db, config);
    scanner.scanMangas(true);
    res.send(config);
  });
  router.get('/default/configuration', async function(req, res) {
    res.send(
      getDefaultConfigs()
    );
  });

  /***************************************************************************
   * User profile
   ***************************************************************************/
  router.get('/favorites/:profileId', async (req, res) => {
    res.send(await db.getFavorites(req.params.profileId));
  });
  router.get('/userprofile', async function(req, res) {
    res.send(await db.allProfiles());
  });
  router.get('/userprofile/:id', async function(req, res) {
    res.send(await db.findUserProfile(req.params.id));
  });
  router.delete('/userprofile/:id', async function(req, res) {
    res.send(await db.deleteUserProfile(req.params.id));
  });
  router.post('/userprofile', async function(req, res) {
    const profile = await db.createOrUpdateUserProfile(req.body)
    res.send(profile);
  });
  router.get('/userprofile/:profileId/advancement', async function(req, res) {
    res.send(
      await db.getAdvancements(
        req.params.profileId
      )
    );
  });
  router.get('/userprofile/:profileId/advancement/:mangaId', async function(req, res) {
    res.send(
      await db.getAdvancementsForManga(
        req.params.profileId,
        req.params.mangaId
      )
    );
  });
  router.post('/userprofile/:profileId/advancement', async function(req, res) {
    await db.updateAdvancement(
      req.params.profileId,
      req.body.sourceId,
      req.body.chapterId,
      req.body.pageNumber
    );
    res.send({status: 'ok'});
  });
  router.post('/userprofile/:profileId/addfav/:mangaId', async function(req, res) {
    res.send(
      await db.addFavoriteToProfile(
        req.params.profileId,
        req.params.mangaId
      )
    );
  });
  router.post('/userprofile/:profileId/rmfav/:mangaId', async function(req, res) {
    res.send(
      await db.removeFavoriteFromProfile(
        req.params.profileId,
        req.params.mangaId
      )
    );
  });
  /***************************************************************************
   * Web push
   ***************************************************************************/
  router.get('/web-push/publickey', (req, res) => {
    res.send( WebpushUtils.getPublicKey() );
  });
  router.get('/web-push/test/:subscriptionId', async (req, res) => {
    const sub = await db.findSubscriptionById(req.params.subscriptionId);
    WebpushUtils.getWebpush().sendNotification(
      JSON.parse(sub.jsonData),
      JSON.stringify({
        title: 'Test',
        body: 'this is a test',
        icon: '/notification-icon.png'
      })
    );
    res.send( { status: 'ok' } );
  });
  router.delete('/web-push/:subscriptionId', async (req, res) => {
    await db.removeSubscription('', {id: req.params.subscriptionId});
    res.send( { status: 'ok' } );
  });
  router.post('/userprofile/:profileId/subscribe', async function(req, res) {
    let subscription = req.body;
    subscription = await db.saveOrUpdateSubscription(req.params.profileId, subscription);
    res.send(subscription);
  });
  router.post('/userprofile/:profileId/unsubscribe', async function(req, res) {
    let subscription = req.body;
    subscription = await db.removeSubscription(req.params.profileId, subscription);
    res.send(subscription);
  });
  /***************************************************************************
   * Tags
   ***************************************************************************/
  router.get('/tag', async (req, res) => {
    res.send(
      await db.allTags()
     );
  });
  router.get('/tag/values', async (req, res) => {
    res.send(
      await db.findTags()
     );
  });
  router.post('/tag', async (req, res) => {
    const tags: Tag[] = req.body;
    for (const tag of tags) {
      await db.tagRepository.save(tag);
    }
    res.send( {status: 'ok'} );
  });
  router.get('/tag/cleanup', async (req, res) => {
    const tags = await db.findTags();
    for (const tag of tags) {
      if (tag.values.length === 0) {
        const del = await db.tagRepository.delete(tag.id);
      }
    }
    const del = await db.tagValueRepository.delete({
      tag: IsNull()
    });
    res.send({
      status: 'ok',
      tag: await db.findTags(),
      tagValue: await db.tagValueRepository.find({
        relations: [ 'tag' ]
      })
    });
  });

  return router;
}
