import { Router } from 'express';
import moment from 'moment';
import { MoreThanOrEqual } from 'typeorm';

import { Database } from '../database/Database';
import { Advancement, ScanSource, Manga, Chapter, Tag } from '../database/entity';
import logger from '../logger';

const ITEM_PER_PAGE = 24;

export default (db: Database) => {
  const router = Router();
  router.get('/', async (req, res) => {
    logger.debug(`MangaAPI --> get all mangas : search ${req.query.page}, ${req.query.search}, ${req.query.tags}`);
    res.send(
      await db.searchMangas(
        ITEM_PER_PAGE,
        req.query.page ? Number(req.query.page) : undefined,
        req.query.search as string,
        req.query.tags as string[]
      )
    );
  });
  router.post('/search', async (req, res) => {
    logger.debug(`MangaAPI --> search mangas : search ${req.body.tags}`);
    res.send(
      await db.mangaByTags(req.body.tags)
    )
  });
  router.get('/leftToRead/:profileId', async (req, res) => {
    logger.debug(`MangaAPI --> Mangas left to read for profile ${req.body.profileId}`);
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
    logger.debug(`MangaAPI --> Mangas similar names`);
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
    logger.debug(`MangaAPI --> Mangas migrate source from ${req.body.from.id} to ${req.body.to.id}`);
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
    logger.debug(`MangaAPI --> Latest insert manga : ${req.params.number} ${req.params.period}`);
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
  router.get('/started/:profileId', async (req, res) => {
    logger.debug(`MangaAPI --> Started manga for profile ${req.params.profileId}`);
    let advs = await db.advancementRepository.find({
      relations: [ 'profile', 'source', 'source.manga' ],
      where: {
        profile: req.params.profileId
      }
    });
    res.send(
      await db.mangaRepository.findByIds(
        advs.map( c => c.source.manga),
        {
          relations: [ 'sources', 'sources.scannerConfig' ]
        }
      )
    );
  });
  router.get('/recomended/:profileId', async (req, res) => {
    logger.debug(`MangaAPI --> Recomended manga for profile ${req.params.profileId}`);
    const query = db.connection.createQueryBuilder()
                  .select(['manga.id', 'manga.name', 'sum(sq.count) as sum'])
                  .from(Manga, 'manga')
                  .innerJoin('manga_tags_tag', 'mt', 'mt."mangaId" = manga.id')
                  .innerJoin(Tag, 'tag', 'tag.id = mt."tagId"')
                  .innerJoin(qb => {
                    return qb.subQuery()
                      .select(['tag.id as id', 'count(tag.id) as count'])
                      .from('user_profile_favorites_manga', 'fav')
                      .innerJoin(Manga, 'manga', 'fav."mangaId" = manga.id')
                      .innerJoin('manga_tags_tag', 'mt', 'manga.id = mt."mangaId"')
                      .innerJoin(Tag, 'tag', 'mt."tagId" = tag.id')
                      .where(`fav."userProfileId" = '${req.params.profileId}'`)
                      .groupBy('tag.id');
                  }, 'sq', 'sq.id = tag.id')
                  .where(qb => {
                    const sub = qb.subQuery()
                      .select(['ufav."mangaId"'])
                      .from('user_profile_favorites_manga', 'ufav')
                      .where(`ufav."userProfileId" = '${req.params.profileId}'`)
                      .getQuery();
                    return 'manga.id NOT IN ' + sub;
                  })
                  .groupBy('manga.id')
                  .orderBy('sum(sq.count)', 'DESC');
                  // that's fucked
                  // .offset((Number(req.query.page) | 0) * ITEM_PER_PAGE)
                  // .limit(ITEM_PER_PAGE);
    let rated = await query.getRawMany();
    const startIndex = (Number(req.query.page) | 0) * ITEM_PER_PAGE;
    rated = rated.slice(startIndex, startIndex + ITEM_PER_PAGE);
    const results = await db.mangaRepository.findByIds(
      rated.map( c => c.manga_id),
      {
        relations: [ 'sources', 'sources.scannerConfig' ],
      }
    );
    res.send(
      results.sort( (a: Manga, b: Manga) => {
        const aRated = rated.find(m => {
          return a.id === m.manga_id;
        });
        const bRated = rated.find(m => {
          return b.id === m.manga_id;
        });
        return bRated.sum - aRated.sum;
      })
    );
  });
  router.get('/similar/:mangaId', async (req, res) => {
    logger.debug(`MangaAPI --> Similar manga to ${req.params.mangaId}`);
    const rated = await db.connection.createQueryBuilder()
      .select('manga.id')
      .from('manga_tags_tag', 'mt')
      .innerJoin(Manga, 'manga', 'manga.id = mt."mangaId"')
      .innerJoin(Tag, 'tag', 'tag.id = mt."tagId"')
      .where(qb => {
        const sub = qb.subQuery()
          .select('mt."tagId"')
          .from('manga_tags_tag', 'mt')
          .where(`mt."mangaId" = '${req.params.mangaId}'`)
          .getQuery();
        return 'mt."tagId" IN ' + sub;
      })
      .andWhere(`manga.id <> '${req.params.mangaId}'`)
      .groupBy('manga.id')
      .orderBy('count(manga.id)', 'DESC')
      .getRawMany();
    res.send(
        await db.mangaRepository.findByIds(
          rated.slice(0, 10).map( c => c.manga_id),
          {
            relations: [ 'sources', 'sources.scannerConfig' ]
          }
        )
      );
  });
  router.get('/untaged', async (req, res) => {
    logger.debug(`MangaAPI --> untaged manga`);
    // SELECT id, name 
    //   FROM   manga
    //   LEFT   JOIN manga_tags_tag mt ON manga.id = mt."mangaId"  -- short for: ON i.ip = l.ip
    //   WHERE  mt."mangaId" IS NULL;
    
    const untaged = await db.connection.createQueryBuilder()
      .select(['manga.id'])
      .from(Manga, 'manga')
      .leftJoin('manga_tags_tag', 'mt', 'manga.id = mt."mangaId"')
      .where('mt."mangaId" IS NULL')
      .getMany()
    res.send(
      await db.mangaRepository.findByIds(
        untaged.map( c => c.id),
        {
          relations: [ 'sources', 'sources.scannerConfig' ],
          order: {
            name: 'ASC'
          }
        }
      )
    );
  });
  router.post('/:mangaId/addTag/:tagId', async (req, res) => {
    logger.debug(`MangaAPI --> Add tag ${req.params.tagId} to manga ${req.params.mangaId}`);
    const manga = await db.mangaRepository.findOne(req.params.mangaId, {
      relations: [ 'tags' ]
    });
    const tag = await db.tagRepository.findOne(req.params.tagId);
    manga.tags.push(tag);
    res.send(
      await db.mangaRepository.save(manga)
    );
  });
  router.post('/:mangaId/removeTag/:tagId', async (req, res) => {
    logger.debug(`MangaAPI --> Remove tag ${req.params.tagId} from manga ${req.params.mangaId}`);
    const manga = await db.mangaRepository.findOne(req.params.mangaId, {
      relations: [ 'tags' ]
    });
    manga.tags = manga.tags.filter(t => ''+t.id !== req.params.tagId)
    res.send(
      await db.mangaRepository.save(manga)
    );
  });
  router.get('/:id', async function(req, res) {
    logger.debug(`MangaAPI --> Get manga ${req.params.id}`);
    res.send(
      await db.findMangaById(req.params.id)
    );
  });
  return router;
}
