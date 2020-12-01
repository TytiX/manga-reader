import axios from 'axios';
// import { axiosCloudflare } from './cloudflare-craper';
// axiosCloudflare(axios);
// TODO: test on next cloudfare error
// import cloudfareScraper from 'cloudflare-scraper';

export class http {
  static get(url: string): Promise<any> {
    return new Promise( (resolve, reject) => {

      axios.get(url).then( res => {
        resolve(res.data);
      }).catch(e => {
        reject(e);
      });

    });
  }
  static async stream(url: string): Promise<any> {
    // return hooman.stream(url);
    const response = await axios.get(url, { responseType: 'stream' })
    return response.data;
  }
}
