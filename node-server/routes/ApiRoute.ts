import { Router } from 'express';
import { Database } from '../database/Database';

import MangaRoutes from './MangaRoutes';
import SourceRoutes from './SourceRoutes';
import ChapterRoutes from './ChapterRoutes';
import ConfigurationRoutes from './ConfigurationRoutes';
import UserProfileRoutes from './UserProfileRoutes';
import PushRoutes from './PushRoutes';
import TagRoutes from './TagRoutes';

export default (db: Database) => {

  const router = Router();

  // const database = new Database();
  // database.connect().then( () => {
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
    router.use('userprofile', UserProfileRoutes(db));
    /***************************************************************************
     * Web push
     ***************************************************************************/
    router.use('/web-push', PushRoutes(db));
    /***************************************************************************
     * Tags
     ***************************************************************************/
    router.use('/tag', TagRoutes(db));
  // });

  return router;
}
