import { URL } from 'url';

import { ChapterScanner,
  DefaultChapterScanner,
  KonekoChapterScanner,
  LeCercleDuScanChapterScanner,
  ScantradChapterScanner,
  UnionChapterScanner } from './ChapterScanner';

export class ChapterScannerFactory {

  static from(link: string): ChapterScanner {
    const url = new URL(link);
    let scanner: ChapterScanner = new DefaultChapterScanner();
    switch(url.host) {
      case 'www.scan-vf.net':
      case 'www.frscan.me':
      case 'scan-op.net':
      case 'www.lelscan-vf.me':
        scanner = new DefaultChapterScanner();
        break;
      case 'lel.lecercleduscan.com':
        scanner = new LeCercleDuScanChapterScanner();
        break;
      case 'www.koneko-scantrad.fr':
      case 'lel.koneko-scantrad.fr':
        scanner = new KonekoChapterScanner();
        break;
      case 'scantrad-union.com':
        scanner = new UnionChapterScanner();
        break;
      case 'scantrad.net':
        scanner = new ScantradChapterScanner();
        break;
    }
    return scanner;
  }

}
