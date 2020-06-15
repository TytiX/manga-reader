import {createConnection, Connection, getRepository, Repository} from 'typeorm';

import { Manga, ScanSource, Chapter, Page, ScannerConfig } from './entity';
import logger from '../logger';

export class Database {
  connection?: Connection;
  mangaRepository: Repository<Manga>;
  sourceRepository: Repository<ScanSource>;
  chapterRepository: Repository<Chapter>;
  pageRepository: Repository<Page>;
  configRepository: Repository<ScannerConfig>;

  constructor() { }

  async connect() {
    this.connection = await createConnection({
      type: 'sqlite',
      database: './database.db',
      synchronize: true,
      entities: [
        Manga,
        ScanSource,
        Chapter,
        Page,
        ScannerConfig
      ]
    });
    this.mangaRepository = getRepository(Manga);
    this.sourceRepository = getRepository(ScanSource);
    this.chapterRepository = getRepository(Chapter);
    this.pageRepository = getRepository(Page);
    this.configRepository = getRepository(ScannerConfig);
    return this.connection;
  }

  async allMangas(): Promise<Manga[]> {
    return await this.mangaRepository.find({
      relations: ['sources'],
      order: {
        'name': 'ASC'
      }
    });
  }
  async findMangaById(id: string): Promise<Manga> {
    return await this.mangaRepository.findOne({
      relations: ['sources', 'sources.chapters'],
      where: { id: id }
    });
  }
  async findSourceById(id: string): Promise<ScanSource> {
    return await this.sourceRepository.findOne({
      relations: ['chapters'],
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
  async addScanSourceToManga(manga: Manga, source: { name: string; link: string; }, config: ScannerConfig): Promise<[Manga, ScanSource]> {
    let scanSource = new ScanSource();
    scanSource.name = source.name;
    scanSource.link = source.link;
    scanSource.scannerConfig = config;
    scanSource = await this.sourceRepository.save(scanSource);

    manga.sources.push(scanSource);
    return [await this.mangaRepository.save(manga), scanSource];
  }
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
      where: { link }
    });
    if (chapter) {
      if (chapter.source) {
        const source = await this.sourceRepository.findOne(chapter.source.id);
        return [source, chapter];
      } else {
        await this.chapterRepository.delete(chapter);
      }
    }
    return [undefined, undefined];
  }
  async addChapterToSource(source: ScanSource, chapter: { name: string; number: number; link: string; }): Promise<[ScanSource, Chapter]> {
    let chapterEntity = new Chapter();
    chapterEntity.name = chapter.name;
    chapterEntity.number = chapter.number;
    chapterEntity.link = chapter.link;
    chapterEntity.source = source;
    chapterEntity = await this.chapterRepository.save(chapterEntity);

    if (source.chapters) {
      source.chapters.push(chapterEntity);
    } else {
      source.chapters = [chapterEntity];
    }
    return [await this.sourceRepository.save(source), chapterEntity];
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
  
  async updateScanSource(source: ScanSource): Promise<ScanSource> {
    return await this.sourceRepository.save(source);
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
}
