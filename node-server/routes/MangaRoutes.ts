import { Router } from 'express';
import * as moment from 'moment';
import { MoreThanOrEqual } from 'typeorm';

import { Database } from '../database/Database';
import { Advancement, ScanSource, Manga, Chapter } from '../database/entity';
import logger from '../logger';

export default (db: Database) => {
  const router = Router();
  router.get('/', async (req, res) => {
    res.send(
      await db.searchMangas(
        req.query.search as string,
        req.query.tags as string[]
      )
    );
  });
  router.post('/search', async (req, res) => {
    res.send(
      await db.mangaByTags(req.body.tags)
    )
  });
  router.get('/leftToRead/:profileId', async (req, res) => {
    const read = await db.connection.createQueryBuilder()
                  .select(['adv.id as "advId"', 'manga.id as "mangaId"', 'manga.name', 'count(chapter.id)'])
                  .from(Advancement, 'adv')
                  .innerJoin(ScanSource, 'source', 'source.id = adv."sourceId"')
                  .innerJoin(Manga, 'manga', 'manga.id = source."mangaId"')
                  .innerJoin(Chapter, 'chapter', 'chapter."sourceId" = source.id')
                  .innerJoin(Chapter, 'advchapter', 'adv."chapterId" = advchapter.id')
                  .where('adv."profileId" = \'' + req.params.profileId + '\'')
                  .andWhere('chapter.number > advchapter.number')
                  .groupBy('adv.id')
                  .addGroupBy('manga.id')
                  .getRawMany();
    res.send( read );
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
  router.get('/latelly/:number-:period', async (req, res) => {
    let chapters = await db.chapterRepository.find({
      relations: [ 'source', 'source.manga' ],
      where: {
        createDate: MoreThanOrEqual(
          moment().subtract( //5, 'hours')
            Number(req.params.number),
            req.params.period as any
          ).toDate()
        )
      }
    });
    res.send(
      await db.mangaRepository.findByIds(
        chapters.map( c => c.source.manga),
        {
          relations: [ 'sources', 'sources.scannerConfig' ]
        }
      )
    );
  });
  router.get('/:id', async function(req, res) {
    res.send(
      await db.findMangaById(req.params.id)
    );
  });
  return router;
}
