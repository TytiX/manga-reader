import { URL } from "url";

export class UrlUtils {

  static chapterCleanup(url: string) {
    return url.replace(' ', '')
      .replace(',', '.')
      .replace('%20', '')
      .replace('%60', '')
      .replace('%5D', '');
  }

  static imgLinkCleanup(url: string) {
    if (UrlUtils.isURL(url)) {
      return url;
    } else {
      const urlTrimmed = url.trim();
      if (UrlUtils.isURL(urlTrimmed)) {
        return urlTrimmed;
      } else {
        const encoded = UrlUtils.encodePartial(urlTrimmed);
        if (UrlUtils.isURL(encoded)) {
          return encoded;
        } else {
          if (urlTrimmed.startsWith('//')) {
            return urlTrimmed.replace('//', 'https://');
          } else {
            return urlTrimmed;
          }
        }
      }
    }
  }

  static encodePartial(url: string) {
    return url.replace(' ', '%20');
  }

  static isURL(str: string): boolean {
    const urlRegex = 'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)'
    // const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    var url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }

  static completeUrl(domain: string, link: string) {
    if (UrlUtils.isURL(link)) {
      return link;
    } else {
      if (link.startsWith('/')) {
        return domain.concat(link)
      } else {
        return link;
      }
    }
  }

}
