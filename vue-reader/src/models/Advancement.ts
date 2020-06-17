import { ScanSource } from './ScanSource';
import { Chapter } from './Chapter';
import { UserProfile } from './UserProfile';

export interface Advancement {
  id: string;
  pageNumber: number;

  source: ScanSource;
  chapter: Chapter;
  profile: UserProfile;
}
