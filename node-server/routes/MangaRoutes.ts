import { Router } from 'express';
import { createQueryBuilder } from 'typeorm';

import { Database } from '../database/Database';
import { ScanSource } from '../database/entity';

export default (db: Database) => {
  const router = Router();
  router.get('/', async function(req, res) {
    res.send(
      await db.allMangas()
    );
  });
  router.post('/search', async function(req, res) {
    res.send(
      await db.mangaByTags(req.body.tags)
    )
  });
  router.get('/simili', async (req, res) => {
    const mangas = await db.connection.createQueryBuilder()
      .select([
        'm1.id',
        'm1.name',
        'm2.id',
        'm2.name'
      ])
      .from('Manga', 'm1')
      .innerJoin('Manga', 'm2', 'lower(m1.name) = lower(m2.name)')
      .where('m1.id <> m2.id')
      .getRawMany();
    res.send(mangas);
  });
  router.post('/migrateSources', async (req, res) => {
    const fromId = req.body.from.id
    const toId = req.body.to.id;

    try {
      const toManga = await db.mangaRepository.findOne(toId);
      const sources = await db.sourceRepository.find({
        where: {
          manga: { id: fromId}
        }
      });
      sources.map(s => s.manga = toManga);
      await db.sourceRepository.save(sources);

      await db.mangaRepository.delete(fromId);
  
      res.send({ status: 'ok' });
    } catch (e) {
      res.send(e);
    }
  });
  router.get('/:id', async function(req, res) {
    res.send(
      await db.findMangaById(req.params.id)
    );
  });
  return router;
}
