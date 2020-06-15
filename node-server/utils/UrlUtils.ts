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
        return urlTrimmed.replace('//', 'https://');
      }
    }
  }

  static isURL(str: string): boolean {
    var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    var url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }

}
