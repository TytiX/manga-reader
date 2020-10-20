import { Connection, getRepository, Repository, In, createQueryBuilder, MoreThan, LessThan, SelectQueryBuilder, Like } from 'typeorm';

import {
  Manga,
  Tag,
  TagValue,
  ScanSource,
  Chapter,
  Page,
  ScannerConfig,
  UserProfile,
  Advancement,
  Subscription } from './entity';
import logger from '../logger';

import { DatabaseConnectionManager } from './DatabaseConnectionManager';

export class Database {
  connection?: Connection;

  mangaRepository: Repository<Manga>;
  sourceRepository: Repository<ScanSource>;
  chapterRepository: Repository<Chapter>;
  configRepository: Repository<ScannerConfig>;
  userProfileRepository: Repository<UserProfile>;
  advancementRepository: Repository<Advancement>;
  subscriptionRepository: Repository<Subscription>;
  tagRepository: Repository<Tag>;
  tagValueRepository: Repository<TagValue>;

  constructor() { }

  async connect(connectionName: string) {
    this.connection = await DatabaseConnectionManager.getOrCreate(connectionName);

    this.mangaRepository = getRepository(Manga, this.connection.name);
    this.sourceRepository = getRepository(ScanSource, this.connection.name);
    this.chapterRepository = getRepository(Chapter, this.connection.name);
    this.configRepository = getRepository(ScannerConfig, this.connection.name);
    this.userProfileRepository = getRepository(UserProfile, this.connection.name);
    this.advancementRepository = getRepository(Advancement, this.connection.name);
    this.subscriptionRepository = getRepository(Subscription, this.connection.name);
    this.tagRepository = getRepository(Tag, this.connection.name);
    this.tagValueRepository = getRepository(TagValue, this.connection.name);

    return this.connection;
  }

  /***************************************************************************
   * Mangas
   ***************************************************************************/
  async allMangas(): Promise<Manga[]> {
    return await this.mangaRepository.find({
      relations: [ 'sources', 'sources.scannerConfig' ],
      order: {
        'name': 'ASC'
      }
    });
  }
  async searchMangas(itemPerPage: number, page?: number, search?: string, tagsIds?: string[]) {
    let ids;
    if (tagsIds) {
      ids = tagsIds.map(tid => Number(tid));
    }
    const query = createQueryBuilder<Manga>(Manga, 'manga', this.connection.name)
                  .leftJoinAndMapMany('manga.sources', 'manga.sources', 'source', 'source."mangaId" = manga.id')
                  .leftJoinAndMapOne('source.scannerConfig', 'source.scannerConfig', 'config', 'source."scannerConfigId" = config.id')
    if (search) {
      query.where('LOWER(manga.name) LIKE :name', { name: '%' + search.toLowerCase() + '%' })
    }
    if (ids) {
      const subQ = (qb: SelectQueryBuilder<Manga>) => {
        const subQ = qb.subQuery()
                      .select('manga.id')
                      .from(Manga, 'manga')
                      .innerJoin('manga_tags_tag', 'manga_tag', 'manga.id = manga_tag."mangaId"')
                      .innerJoin(Tag, 'tag', 'manga_tag."tagId" = tag.id')
                      .where('tag.id IN (:...ids)', { ids })
                      .groupBy('manga.id')
                      .having('count(manga.id) >= ' + ids.length)
                      .getQuery();
        return 'manga.id IN ' + subQ;
      }
      if (search) {
        query.andWhere(subQ);
      } else {
        query.where(subQ);
      }
    }
    query.addOrderBy('manga.name', 'ASC');
    if (page !== undefined) {
      query.skip((page | 0) * itemPerPage).take(itemPerPage);
    }
    const mangas = await query.getMany();
    return mangas;
  }
  async mangaByTags(tags: Tag[]): Promise<Manga[]> {
    const ids = tags.map(t => t.id);
    const query = createQueryBuilder<Manga>(Manga, 'manga', this.connection.name)
                  .leftJoinAndMapMany('manga.sources', 'manga.sources', 'source', 'source."mangaId" = manga.id')
                  .leftJoinAndMapOne('source.scannerConfig', 'source.scannerConfig', 'config', 'source."scannerConfigId" = config.id')
                  .where( qb => {
                    const subQ = qb.subQuery()
                                  .select('manga.id')
                                  .from(Manga, 'manga')
                                  .innerJoin('manga_tags_tag', 'manga_tag', 'manga.id = manga_tag."mangaId"')
                                  .innerJoin(Tag, 'tag', 'manga_tag."tagId" = tag.id')
                                  .where('tag.id IN (:...ids)', { ids })
                                  .groupBy('manga.id')
                                  .having('count(manga.id) >= ' + ids.length)
                                  .getQuery();
                    return 'manga.id IN ' + subQ;
                  })
                  .addOrderBy('manga.name', 'ASC');
    const mangas = await query.getMany();
    return mangas;
  }
  async findMangaById(id: string): Promise<Manga> {
    return await this.mangaRepository.findOne({
      relations: ['sources', 'sources.chapters', 'tags'],
      where: { id }
    });
  }
  async createManga(name: string, source: { name: string; link: string; }, config: ScannerConfig): Promise<[Manga, ScanSource]> {
    let manga = new Manga();
    manga.name = name;
    manga = await this.mangaRepository.save(manga);

    let scanSource = new ScanSource();
    scanSource.name = source.name;
    scanSource.link = source.link;
    scanSource.manga = manga;
    scanSource.scannerConfig = config;
    try {
      scanSource = await this.sourceRepository.save(scanSource);
    } catch (e) {
      logger.error(`${e}`);
    }

    manga.sources = [scanSource];
    manga = await this.mangaRepository.save(manga);

    return [manga, scanSource];
  }
  async createMangaAndSource(source: ScanSource) {
    const manga = new Manga();
    manga.name = source.manga.name;
    const dbManga = await this.mangaRepository.save(manga);

    source.manga = dbManga;
    return await this.sourceRepository.save(source);
  }
  /***************************************************************************
   * Sources
   ***************************************************************************/
  async findSourceById(id: string): Promise<ScanSource> {
    return await this.sourceRepository.findOne({
      relations: ['chapters', 'manga'],
      where: { id: id }
    });
  }
  async findMangaByName(name: string): Promise<Manga> {
    return await this.mangaRepository.findOne({
      relations: ['sources', 'tags'],
      where: { name: Like(name) }
    });
  }
  async findMangaBySourceLink(link: string): Promise<[Manga, ScanSource]> {
    const source = await this.sourceRepository.findOne({
      relations: ['manga'],
      where: { link }
    });
    let manga = undefined
    if (source) {
      manga = await this.mangaRepository.findOne({
        relations: ['sources'],
        where: { id: source.manga.id }
      });
    }
    return [manga, source];
  }
  async findSourceByLink(link: string): Promise<ScanSource> {
    return await this.sourceRepository.findOne({
      relations: ['manga', 'manga.tags'],
      where: { link }
    })
  }
  async addScanSourceToManga(manga: Manga, source: { name: string; link: string; }, config: ScannerConfig): Promise<[Manga, ScanSource]> {
    let scanSource = new ScanSource();
    scanSource.name = source.name;
    scanSource.link = source.link;
    scanSource.scannerConfig = config;
    scanSource = await this.sourceRepository.save(scanSource);

    manga.sources.push(scanSource);
    return [await this.mangaRepository.save(manga), scanSource];
  }
  async addSourceToManga(manga: Manga, source: ScanSource): Promise<ScanSource> {
    source.manga = manga;
    return await this.sourceRepository.save(source);
  }
  async updateScanSource(source: ScanSource): Promise<ScanSource> {
    return await this.sourceRepository.save(source);
  }
  async updateReadMode(id: string, mode: string) {
    const source = await this.sourceRepository.findOne(id);
    source.reading = mode;
    return await this.sourceRepository.save(source);
  }
  /***************************************************************************
   * Chapters
   ***************************************************************************/
  async findChapterById(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      relations: [ 'source', 'source.manga' ],
      where: { id }
    });
    return chapter;
  }
  async findChapterByLink(link: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      relations: ['source'],
      where: { link: link }
    });
    if (chapter) {
      if (chapter.source) {
        return chapter;
      } else {
        await this.chapterRepository.remove(chapter);
      }
    }
    return undefined;
  }
  async addChapterToSource(source: ScanSource, chapter: { name: string; number: number; link: string; }): Promise<Chapter> {
    let chapterEntity = new Chapter();
    chapterEntity.name = chapter.name;
    chapterEntity.number = chapter.number;
    chapterEntity.link = chapter.link;
    chapterEntity.source = source;
    chapterEntity = await this.chapterRepository.save(chapterEntity);

    return chapterEntity;
  }
  async addPagesToChapter(chapterId: string, pages: Page[]) {
    const chapter = await this.chapterRepository.findOne(chapterId);
    chapter.scanned = true;
    chapter.pages = pages;
    await this.chapterRepository.save(chapter);
  }
  /***************************************************************************
   * Chapters
   ***************************************************************************/
  async findNextChapterById(chapterId: string) {
    const chapter = await this.chapterRepository.findOne(chapterId, {
      relations: ['source']
    });
    const previous = await this.chapterRepository.findOne({
      where: {
        number: MoreThan(chapter.number),
        source: {
          id: chapter.source.id
        }
      },
      order: {
        number: 'ASC'
      }
    });
    return previous;
  }
  async findPreviousChapterById(chapterId: string) {
    const chapter = await this.chapterRepository.findOne(chapterId, {
      relations: ['source']
    });
    const previous = await this.chapterRepository.findOne({
      where: {
        number: LessThan(chapter.number),
        source: { id: chapter.source.id }
      },
      order: { number: 'DESC' }
    });
    return previous;
  }

  /***************************************************************************
   * Configurations
   ***************************************************************************/
  async allConfigs(): Promise<ScannerConfig[]> {
    return await this.configRepository.find();
  }
  async findScanConfigById(id: string): Promise<ScannerConfig> {
    return await this.configRepository.findOne(id);
  }

  async createOrUpdateScanConfig(config: ScannerConfig): Promise<ScannerConfig> {
    return await this.configRepository.save(config);
  }
  
  async deleteConfig(id: string): Promise<boolean> {
    try {
      await this.configRepository.delete(id);
      return true;
    } catch(e) {
      logger.error(`${e}`);
      return false;
    }
  }
  
  /***************************************************************************
   * User profile
   ***************************************************************************/
  async allProfiles(): Promise<UserProfile[]> {
    return await this.userProfileRepository.find({
      relations: [ 'subscriptions' ]
    });
  }
  async findUserProfile(id: string): Promise<UserProfile> {
    return await this.userProfileRepository.findOne(id, {
      relations: ['favorites']
    });
  }
  async deleteUserProfile(id: string) {
    return await this.userProfileRepository.delete([id]);
  }
  async createOrUpdateUserProfile(profile: UserProfile): Promise<UserProfile> {
    return await this.userProfileRepository.save(profile);
  }
  async addFavoriteToProfile(profileId: string, mangaId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne(profileId, {
      relations: [ 'favorites' ]
    });
    const manga = await this.mangaRepository.findOne(mangaId);
    if (profile.favorites) {
      profile.favorites.push(manga);
    } else {
      profile.favorites = [manga];
    }
    return await this.userProfileRepository.save(profile);
  }
  async removeFavoriteFromProfile(profileId: string, sourceId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne(profileId, {
      relations: [ 'favorites' ]
    });
    if (profile.favorites) {
      const toRemove = profile.favorites.findIndex( f => f.id === sourceId);
      profile.favorites.splice(toRemove, 1);
    }
    return await this.userProfileRepository.save(profile);
  }
  async getFavorites(profileId: string): Promise<Manga[]> {
    const profile = await this.userProfileRepository.findOne(profileId, {
      relations: [ 'favorites', 'favorites.sources', 'favorites.sources.scannerConfig' ]
    });
    return profile.favorites;
  }
  /***************************************************************************
   * Advancement
   ***************************************************************************/
  async getAdvancements(profileId) {
    return await this.advancementRepository.find({
      relations: [ 'profile', 'source', 'source.manga', 'chapter' ],
      where: {
        profile: profileId
      }
    });
  }
  async getAdvancementsForManga(profileId: string, mangaId: string) {
    logger.debug(`p: ${profileId} --> m: ${mangaId}`);
    const manga = await this.mangaRepository.findOne(mangaId, {
      relations: ['sources']
    });
    const sourcesIds = manga.sources.map(s => s.id);
    return await this.advancementRepository.find({
      relations: [ 'profile', 'source', 'source.scannerConfig', 'chapter' ],
      where: {
        profile: profileId,
        source: {
          id: In(sourcesIds)
        }
      }
    });
  }
  async updateAdvancement(profileId: string, sourceId: string, chapterId: string, pageNumber: number) {
    let adv = await this.advancementRepository.findOne({
      where: {
        profile: {
          id: profileId
        },
        source: {
          id: sourceId
        }
      }
    });
    if (!adv) {
      adv = new Advancement();
      const profile = await this.findUserProfile(profileId);
      const source = await this.findSourceById(sourceId);
      adv.profile = profile;
      adv.source = source;
    }
    const chapter = await this.findChapterById(chapterId);
    adv.chapter = chapter;
    adv.pageNumber = pageNumber;

    await this.advancementRepository.save(adv);
  }

  /***************************************************************************
   * Push subscriptions
   ***************************************************************************/
  async saveOrUpdateSubscription(profileId: string, sub: any) {
    const profile = await this.userProfileRepository.findOne(profileId);
    const subsciption = new Subscription();
    subsciption.jsonData = JSON.stringify(sub);
    subsciption.profile = profile;
    return await this.subscriptionRepository.save(subsciption);
  }
  async removeSubscription(profileId: string, sub: any) {
    await this.subscriptionRepository.delete(sub.id);
  }
  async findSubscriptionById(subId: string) {
    return await this.subscriptionRepository.findOne(subId);
  }
  
  /***************************************************************************
   * Tags
   ***************************************************************************/
  async allTags() {
    return await this.tagRepository.find({
      order: {
        name: 'ASC'
      }
    });
  }
  async findTags() {
    return await this.tagRepository.find({
      relations: [ 'values' ],
      order: {
        name: 'ASC'
      }
    });
  }
  async associateMangaWithTags(m: Manga, values: string[]) {
    const manga = await this.mangaRepository.findOne(m.id, {
      relations: [ 'tags' ]
    });
    const tags = await this.findTagsByValues(values);
    for (const tag of tags) {
      const found = manga.tags.find(t => t.id === tag.id);
      if (!found) {
        manga.tags.push(tag);
      }
    }
    return await this.mangaRepository.save(manga);
  }
  async findTagsByValues(values: string[]) {
    const tags: Tag[] = []
    for (const value of values) {
      let tag = await this.findTagByValue(value);
      if (!tag) {
        tag = await this.createTagFromValue(value);
      }
      tags.push(tag);
    }
    return tags;
  }
  async findTagByValue(value: string) {
    const tag = await createQueryBuilder<Tag>('Tag', 'tag', this.connection.name)
                  .leftJoinAndSelect('tag.values', 'tag_value')
                  .where('tag_value.value = :name', { name: value })
                  .getOne();
    return tag;
  }
  async createTagFromValue(value: string) {
    let tag = new Tag();
    tag.name = value;
    tag = await this.tagRepository.save(tag);
    let tagValue = new TagValue();
    tagValue.value = value;
    tagValue.tag = tag;
    tagValue = await this.tagValueRepository.save(tagValue);
    return this.tagRepository.findOne(tag.id);
  }
}
