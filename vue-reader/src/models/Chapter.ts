import { ScanSource } from './ScanSource';
import { Page } from './Page';

export interface Chapter {
  id: string;
  name: string;
  number: number;
  link: string;
  scanned: boolean;
  source: ScanSource;
  pages: Page[];
}
