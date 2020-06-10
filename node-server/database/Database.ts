import {createConnection, Connection, getRepository, Repository} from "typeorm";

import { Manga, ScanSource, Chapter, Page } from './entity';
import logger from "../logger";

export class Database {
  connection?: Connection;
  mangaRepository: Repository<Manga>;
  sourceRepository: Repository<ScanSource>;
  chapterRepository: Repository<Chapter>;

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
        Page
      ]
    });
    this.mangaRepository = getRepository(Manga);
    this.sourceRepository = getRepository(ScanSource);
    this.chapterRepository = getRepository(Chapter);
    return this.connection;
  }


  async allMangas(): Promise<Manga[]> {
    return await this.mangaRepository.find({
      relations: ['sources']
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
  async createManga(name: string, source: { name: string; link: string; }): Promise<[Manga, ScanSource]> {
    let scanSource = new ScanSource();
    scanSource.name = source.name;
    scanSource.link = source.link;
    scanSource = await this.sourceRepository.save(scanSource);

    const manga = new Manga();
    manga.name = name;
    manga.sources = [scanSource];

    return [await this.mangaRepository.save(manga), scanSource];
  }
  async addScanSourceToManga(manga: Manga, source: { name: string; link: string; }): Promise<[Manga, ScanSource]> {
    let scanSource = new ScanSource();
    scanSource.name = source.name;
    scanSource.link = source.link;
    scanSource = await this.sourceRepository.save(scanSource);

    manga.sources.push(scanSource);
    return [await this.mangaRepository.save(manga), scanSource];
  }
  async findChapterByLink(link: string): Promise<[ScanSource, Chapter]> {
    const chapter = await this.chapterRepository.findOne({
      relations: ['source'],
      where: { link }
    });
    if (chapter) {
      const source = await this.sourceRepository.findOne(chapter.source.id);
      return [source, chapter];
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

}
