import { Router } from 'express';

import { Database } from '../database/Database';
import axios from 'axios';

export default (db: Database) => {
  const router = Router();

  router.get('/:chapterId/:pageNumber', async (req, res) => {
    const chapter = await db.findChapterById(req.params.chapterId);
    const response = await axios.get(
      chapter.pages.find(
        p => p.number = Number(req.params.pageNumber)
      ).url,
      { responseType:'stream' }
    )
    response.data.pipe(res);
  });

  return router;
}
