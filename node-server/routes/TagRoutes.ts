import { Router } from "express";

import { Database } from "../database/Database";
import { IsNull } from "typeorm";
import { Tag } from "../database/entity/Tag";

export default (db: Database) => {
  const router = Router();

  router.get('/', async (req, res) => {
    res.send(
      await db.allTags()
     );
  });
  router.get('/values', async (req, res) => {
    res.send(
      await db.findTags()
     );
  });
  router.post('/', async (req, res) => {
    const tags: Tag[] = req.body;
    for (const tag of tags) {
      await db.tagRepository.save(tag);
    }
    res.send( {status: 'ok'} );
  });
  router.get('/cleanup', async (req, res) => {
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
