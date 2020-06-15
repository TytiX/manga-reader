<template>
  <div class="card mt-3">
    <b-img-lazy :src="coverUrl" fluid></b-img-lazy>
    {{manga.name}}
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { Manga } from '@/models';

@Component
export default class MangaListItem extends Vue {
  @Prop()
  manga!: Manga;

  try = 0;
  coverUrl!: string;

  created() {
    this.pickRandomCoverUrl();
  }

  pickRandomCoverUrl() {
    const sourceLength = this.manga.sources.length;
    const index = Math.floor( Math.random() * sourceLength );
    const url = this.manga.sources[index].coverLink;
    if (this.isURL(url)) {
      this.coverUrl = url;
    } else if (this.try < 5) {
      this.try++;
      this.pickRandomCoverUrl();
    }
  }

  isURL(str: string): boolean {
    const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    const url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }

}
</script>

<style>

</style>