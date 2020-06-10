import { ScanSource } from './ScanSource';
import { Page } from './Page';

export interface Chapter {
  id: string;
  name: string;
  number: number;
  link: string;
  source: ScanSource;
  pages: Page[];
}
