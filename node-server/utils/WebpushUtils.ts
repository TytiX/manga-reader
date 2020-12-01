import webpush from 'web-push';
import fs from 'fs';

export class WebpushUtils {

  static generateIfNotExist() {
    if (!fs.existsSync('./data/vapidkeys.keys')) {
      const vapidKeys = webpush.generateVAPIDKeys();
      fs.writeFileSync(
        './data/vapidkeys.keys',
        JSON.stringify(vapidKeys)
      );
    }
  }

  static getPublicKey() {
    let publicKey;
    if (fs.existsSync('./data/vapidkeys.keys')) {
      const strVapidKeys = fs.readFileSync('./data/vapidkeys.keys');
      publicKey = JSON.parse(strVapidKeys.toString()).publicKey;
    }
    return publicKey;
  }

  static getWebpush() {
    if (fs.existsSync('./data/vapidkeys.keys')) {
      const strVapidKeys = fs.readFileSync('./data/vapidkeys.keys');
      const vapidKey = JSON.parse(strVapidKeys.toString());
      webpush.setVapidDetails('mailto:developper.belliard@gmail.com', vapidKey.publicKey, vapidKey.privateKey);
      return webpush;
    }
    return null;
  }

}


