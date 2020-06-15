
export interface ScannerConfig {
  id?: string;
  name?: string;
  iconUrl?: string;

  mangasListUrl?: string;

  mangaEnclosingXpath?: string;
  mangaLinkRelativeXpath?: string;
  mangaNameRelativeXpath?: string;

  mangaDescriptionXpath?: string;
  mangaCoverXpath?: string;
  chapterEnclosingXpath?: string;
  chapterLinkRelativeXpath?: string;
  chapterNumberTextRelativeXpath?: string;
  chapterNameRelativeXpath?: string;
}
 