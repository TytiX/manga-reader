import { ScanSource } from './ScanSource';
import { Tag } from './Tag';

export interface Manga {
  id: string;
  name: string;

  tags: Tag[];

  sources: ScanSource[];
}
