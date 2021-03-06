import { Router } from 'express';
import { Database } from '../database/Database';

import MangaRoutes from './MangaRoutes';
import SourceRoutes from './SourceRoutes';
import ChapterRoutes from './ChapterRoutes';
import ConfigurationRoutes from './ConfigurationRoutes';
import UserProfileRoutes from './UserProfileRoutes';
import PushRoutes from './PushRoutes';
import TagRoutes from './TagRoutes';
import ImageRoutes from './ImageRoutes';
import logger from '../logger';

export default () => {

  const router = Router();

  const db = new Database();
  db.connect('api-connection').then( () => {
    /***************************************************************************
     * Mangas
     ***************************************************************************/
    router.use('/manga', MangaRoutes(db));
    /***************************************************************************
     * Sources
     ***************************************************************************/
    router.use('/source', SourceRoutes(db));
    /***************************************************************************
     * Chapters
     ***************************************************************************/
    router.use('/chapter', ChapterRoutes(db));
    /***************************************************************************
     * Configurations
     ***************************************************************************/
    router.use('/configuration', ConfigurationRoutes(db));
    /***************************************************************************
     * User profile
     ***************************************************************************/
    router.get('/favorites/:profileId', async (req, res) => {
      res.send(await db.getFavorites(req.params.profileId));
    });
    router.use('/userprofile', UserProfileRoutes(db));
    /***************************************************************************
     * Web push
     ***************************************************************************/
    router.use('/web-push', PushRoutes(db));
    /***************************************************************************
     * Tags
     ***************************************************************************/
    router.use('/tag', TagRoutes(db));
    /***************************************************************************
     * Advancement
     ***************************************************************************/
    router.delete('/advancement/:id', async (req, res) => {
      res.send(
        await db.advancementRepository.delete(req.params.id)
      );
    });
    /***************************************************************************
     * Images
     ***************************************************************************/
    router.use('/image', ImageRoutes(db));
  }).catch(e => {
    logger.error(`: ImageAPI -> ${e.message} : ${e.stack}`);
  });

  return router;
}
