import { JSDOM } from 'jsdom';
import * as jquery from 'jquery';

export class ScannerJsdom {


  private async scanMangas() {

    const response = await axios.get(this.config.mangasUrl);
    const { window } = new JSDOM(`${response.data}`, {
      resources: 'usable',
      runScripts: 'dangerously'
    });

    // Set window and document from jsdom
    // Mock canvas (used by qtip)
    window.HTMLCanvasElement.prototype.getContext = () => {
      return {};
    };
    const { document } = window;
    // Also set global window and document before requiring jQuery
    global.window = window;
    global.document = document;

    const $ = global.jQuery = jquery(window);

    const mangaLink = window.document.querySelector('div.media > div.media-body > h5.media-heading > a');
    console.log(mangaLink);
    // this.selectAndPrintLis(window);
    // const button = window.document.querySelector('#filter-types > div:nth-child(1)');
    // const button = window.document.querySelector('#filter-types > div:nth-child(1)');
    const button = window.document.querySelector('#text');
    console.log(button);
    button.click();

    // console.log( `jQuery ${jQuery.fn.jquery} working! Yay!!!` );
    // const inputElement = $( '#text' );
    // console.log( inputElement.length );
    // inputElement.click();

    this.selectAndPrintLis(window);
    setTimeout(() => {
      this.selectAndPrintLis(window);
    }, 2000)

    // soxa.get(this.config.mangasUrl).then( (response) => {
    //   // Logger.info(`response : ${JSON.stringify(Object.keys(response))}`);
    //   const doc = new dom().parseFromString(response.data);

    //   var mangaEncloseNodes = xpath.select(this.config.mangaEnclosingXpath, doc);
    //   // Logger.info(`found link nodes : ${JSON.stringify(mangaEncloseNodes.length)}`);

    //   mangaEncloseNodes.forEach( (node: any) => {
    //     // Logger.info(`${node}`);
    //     const parsedNode = new dom().parseFromString(`${node}`);
    //     const nodeLink = xpath.select1(this.config.mangaLinkRelativeXpath, parsedNode);
    //     const name = xpath.select1(this.config.mangaNameRelativeXpath, parsedNode);

    //     console.log(`${name}: ${nodeLink.value}`);

    //     // const manga = this.searchOrCreate(name, nodeLink.value);
    //     // this.scanManga(manga);
    //   });
    // });
  }

  selectAndPrintLis(window: any) {
    const lis = window.document.querySelector('body > div.wrapper > div > div:nth-child(2) > div.col-sm-8.col-sm-pull-4 > div > div.type-content > div.type-content > div > div.panel-body > ul > li');
    console.log(lis);
  }

}
