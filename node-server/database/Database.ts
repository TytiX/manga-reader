import {createConnection, Connection, getRepository, Repository, In, Equal, createQueryBuilder} from 'typeorm';

import { Manga, ScanSource, Chapter, Page, ScannerConfig } from './entity';
import logger from '../logger';
import { UserProfile } from './entity/UserProfile';
import { Tag, TagValue } from './entity/Tag';
import { Advancement } from './entity/Advancement';
import { Subscription } from './entity/Subscription';

export class Database {
  connection?: Connection;
  mangaRepository: Repository<Manga>;
  sourceRepository: Repository<ScanSource>;
  chapterRepository: Repository<Chapter>;
  pageRepository: Repository<Page>;
  configRepository: Repository<ScannerConfig>;
  userProfileRepository: Repository<UserProfile>;
  advancementRepository: Repository<Advancement>;
  subscriptionRepository: Repository<Subscription>;
  tagRepository: Repository<Tag>;
  tagValueRepository: Repository<TagValue>;

  constructor() { }

  async connect() {
    this.connection = await createConnection({
      type: 'sqlite',
      database: './data/database.db',
      synchronize: true,
      // logging: true,
      entities: [
        Manga,
        Tag,
        TagValue,
        ScanSource,
        Chapter,
        Page,
        ScannerConfig,
        UserProfile,
        Advancement,
        Subscription
      ]
    });
    this.mangaRepository = getRepository(Manga);
    this.sourceRepository = getRepository(ScanSource);
    this.chapterRepository = getRepository(Chapter);
    this.pageRepository = getRepository(Page);
    this.configRepository = getRepository(ScannerConfig);
    this.userProfileRepository = getRepository(UserProfile);
    this.advancementRepository = getRepository(Advancement);
    this.subscriptionRepository = getRepository(Subscription);
    this.tagRepository = getRepository(Tag);
    this.tagValueRepository = getRepository(TagValue);
    return this.connection;
  }

  /***************************************************************************
   * Mangas
   ***************************************************************************/
  async allMangas(): Promise<Manga[]> {
    return await this.mangaRepository.find({
      relations: ['sources', 'sources.scannerConfig', 'tags'],
      order: {
        'name': 'ASC'
      }
    });
  }
  async mangaByTags(tags: Tag[]): Promise<Manga[]> {
    const ids = tags.map(t => t.id);
    const query = createQueryBuilder<Manga>('Manga', 'manga')
                  .innerJoinAndSelect('manga.tags', 'tag')
                  .leftJoinAndSelect('manga.sources', 'source')
                  .leftJoinAndSelect('source.scannerConfig', 'scannerConfig')
                  .orderBy('manga.name', 'ASC');
    for (const [pos, tag] of tags.entries()) {
      if (pos === 0) {
        query.where('tag.id = (:'+pos+')', { [pos]: tag.id });
      } else {
        query.andWhere('tag.id = (:'+pos+')', { [pos]: tag.id });
      }
    }
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
      logger.error(e);
    }

    manga.sources = [scanSource];
    manga = await this.mangaRepository.save(manga);

    return [manga, scanSource];
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
      relations: ['sources'],
      where: { name }
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
  async addScanSourceToManga(manga: Manga, source: { name: string; link: string; }, config: ScannerConfig): Promise<[Manga, ScanSource]> {
    let scanSource = new ScanSource();
    scanSource.name = source.name;
    scanSource.link = source.link;
    scanSource.scannerConfig = config;
    scanSource = await this.sourceRepository.save(scanSource);

    manga.sources.push(scanSource);
    return [await this.mangaRepository.save(manga), scanSource];
  }
  async updateScanSource(source: ScanSource): Promise<ScanSource> {
    return await this.sourceRepository.save(source);
  }
  /***************************************************************************
   * Chapters
   ***************************************************************************/
  async findChapterById(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      relations: ['pages', 'source', 'source.manga'],
      where: { id }
    });
    return chapter;
  }
  async findChapterByLink(link: string): Promise<[ScanSource, Chapter]> {
    const chapter = await this.chapterRepository.findOne({
      relations: ['source'],
      where: { link: link }
    });
    if (chapter) {
      if (chapter.source) {
        const source = await this.sourceRepository.findOne(chapter.source.id);
        return [source, chapter];
      } else {
        await this.chapterRepository.remove(chapter);
      }
    }
    return [undefined, undefined];
  }
  async addChapterToSource(source: ScanSource, chapter: { name: string; number: number; link: string; }): Promise<[ScanSource, Chapter]> {
    let chapterEntity = new Chapter();
    chapterEntity.name = chapter.name;
    chapterEntity.number = chapter.number;
    chapterEntity.link = chapter.link;
    chapterEntity = await this.chapterRepository.save(chapterEntity);

    let sourceEntity = await this.sourceRepository.findOne(source.id, {
      relations: ['chapters', 'manga']
    });
    if (sourceEntity.chapters) {
      sourceEntity.chapters.push(chapterEntity);
    } else {
      sourceEntity.chapters = [chapterEntity];
    }
    return [await this.sourceRepository.save(sourceEntity), chapterEntity];
  }

  async addPagesToChapter(chapterId: string, pages: { number: number; url: any; }[]) {
    const chapter = await this.chapterRepository.findOne(chapterId);

    const pagesEntities = [];
    for (const page of pages) {
      let pageEntity = new Page();
      pageEntity.number = page.number;
      pageEntity.url = page.url;
      pageEntity.chapter = chapter;
      pagesEntities.push(pageEntity);
    }
    const dbPages = await this.pageRepository.save(pagesEntities);

    chapter.pages = dbPages;
    await this.chapterRepository.save(chapter);
  }
  async markChapterAsScanned(id: string) {
    const chapter = await this.chapterRepository.findOne(id);
    chapter.scanned = true;
    return await this.chapterRepository.save(chapter);
  }

  /***************************************************************************
   * Chapters
   ***************************************************************************/
  async findNextChapterById(chapterId: string) {
    const chapter = await this.chapterRepository.findOne(chapterId, {
      relations: ['source']
    });
    const chapters = await this.chapterRepository.find({
      where: {
        source: {
          id: chapter.source.id
        }
      },
      order: {
        number: 'ASC'
      }
    });
    let previous = undefined;
    for (const c of chapters) {
      if (c.number > chapter.number) {
        previous = c;
        break;
      }
    }
    return previous;
  }
  async findPreviousChapterById(chapterId: string) {
    const chapter = await this.chapterRepository.findOne(chapterId, {
      relations: ['source']
    });
    const chapters = await this.chapterRepository.find({
      where: {
        source: {
          id: chapter.source.id
        }
      },
      order: {
        number: 'ASC'
      }
    });
    let previous = undefined;
    for (const c of chapters) {
      if (c.number < chapter.number) {
        previous = c;
      } else if (c.number >= chapter.number) {
        break;
      }
    }
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
      // const config = await this.configRepository.findOne(id, {
      //   relations: ['sources', 'sources.chapters', 'sources.chapters.pages']
      // });
      // const sourcesIds: string[] = [];
      // for (const source of config.sources) {
      //   const chaptersIds: string[] = [];
      //   for (const chapter of source.chapters) {
      //     const pageIds: string[] = [];
      //     for (const page of chapter.pages) {
      //       pageIds.push(page.id);
      //     }
      //     if (pageIds.length > 0) await this.pageRepository.delete(pageIds);
      //     chaptersIds.push(chapter.id);
      //   }
      //   if (chaptersIds.length > 0) await this.chapterRepository.delete(chaptersIds);
      //   sourcesIds.push(source.id);
      // }
      // if (sourcesIds.length > 0) await this.sourceRepository.delete(sourcesIds);

      await this.configRepository.delete(id);
      return true;
    } catch(e) {
      logger.error(e);
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
    logger.info(`p: ${profileId} --> m: ${mangaId}`);
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
    const tag = await createQueryBuilder<Tag>('Tag', 'tag')
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
