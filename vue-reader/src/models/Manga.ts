import { ScanSource } from './ScanSource';

export interface Manga {
  id: string;
  name: string;
  sources: ScanSource[];
}
