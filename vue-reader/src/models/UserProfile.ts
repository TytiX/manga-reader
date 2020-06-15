import { ScanSource } from './ScanSource';

export interface UserProfile {
  id: string;
  name: string;
  favorites: ScanSource[];
}
