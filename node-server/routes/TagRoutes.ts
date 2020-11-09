import { Router } from 'express';

import { Database } from '../database/Database';
import { IsNull } from 'typeorm';
import { Tag } from '../database/entity/Tag';
import logger from '../logger';

export default (db: Database) => {
  const router = Router();

  router.get('/', async (req, res) => {
    logger.debug(`TagsAPI --> get All tags`);
    res.send(
      await db.allTags()
     );
  });
  router.get('/values', async (req, res) => {
    logger.debug(`TagsAPI --> get All tags values`);
    res.send(
      await db.findTags()
     );
  });
  router.post('/', async (req, res) => {
    logger.debug(`TagsAPI --> create All tags ${req.body}`);
    const tags: Tag[] = req.body;
    for (const tag of tags) {
      await db.tagRepository.save(tag);
    }
    res.send( {status: 'ok'} );
  });
  router.get('/cleanup', async (req, res) => {
    logger.debug(`TagsAPI --> tag cleanup`);
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
