
export interface ScannerConfig {
  name: string;

  mangasUrl: string;
  mangasListUrl: string;

  pagination: boolean;
  paginationXpath: string;

  mangaEnclosingXpath: string;
  mangaLinkRelativeXpath: string;
  mangaNameRelativeXpath: string;

  mangaLinkXpath: string;
  mangaNameXpath: string;

  chapterEnclosingXpath: string;
  chapterLinkRelativeXpath: string;
  chapterNumberTextRelativeXpath: string;
  chapterNameRelativeXpath: string;
}
