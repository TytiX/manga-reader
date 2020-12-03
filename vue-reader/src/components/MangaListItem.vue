<template>
  <div class="card mt-3">
    <b-img-lazy :src="coverUrl" fluid></b-img-lazy>
    <div class="manga-name">{{manga.name}}</div>
    <div class="sources">
      <b-img-lazy
        v-for="source of manga.sources"
        :key="source.id"
        :src="sourceIcon(source.scannerConfig.iconUrl)"
        class="source-icon">
      </b-img-lazy>
    </div>
    <div class="actions">
      <b-icon v-if="!isFavorite" @click.prevent="fav()" icon="heart"></b-icon>
      <b-icon v-else @click.prevent="unfav()" icon="heart-fill"></b-icon>
    </div>
    <div class="unread">
      <b-badge v-for="[index, unread] of unreadChapters.entries()"
        :key="'unread-' + index + '-' + unread"
        variant="primary"
        pill>{{unread}}</b-badge>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { Manga } from '@/models';

@Component
export default class MangaListItem extends Vue {
  @Prop()
  manga!: Manga;
  @Prop()
  isFavorite!: boolean;
  @Prop()
  unreadChapters!: number[];

  try = 0;
  coverUrl!: string;
  static readonly CoverNotFoundUrl = 'assets/no-cover.png';

  created() {
    this.pickRandomCoverUrl();
  }

  pickRandomCoverUrl() {
    if ( this.manga.sources &&
        this.manga.sources.length > 0 &&
        this.manga.sources[this.try] ) {
      // pick first...
      const url = this.manga.sources[this.try].coverLink;
      if (url && this.isURL(url)) {
        this.coverUrl = `/api/image/fromUrl/${encodeURIComponent(url)}`;
      } else if (this.try < this.manga.sources.length) {
        this.try++;
        this.pickRandomCoverUrl();
      } else {
        this.coverUrl = MangaListItem.CoverNotFoundUrl;
      }
    } else {
      this.coverUrl = MangaListItem.CoverNotFoundUrl;
    }
  }

  sourceIcon(url: string) {
    return `/api/image/fromUrl/${encodeURIComponent(url)}`;
  }

  isURL(str: string): boolean {
    const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    const url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }

  fav() {
    this.$emit('fav', this.manga.id);
  }
  unfav() {
    this.$emit('unfav', this.manga.id);
  }

}
</script>

<style>
.card:hover .img-fluid {
  opacity: 0.3;
}
.source-icon {
  max-height: 32px;
  max-width: 32px;
}
/* .manga-name {
  height: 3rem;
} */
.actions {
  position: absolute;
  margin: 5px;
}
.unread {
  position: absolute;
  right: 0;
  margin: 5px;
}
/* .sources {
  height: 20px;
} */
</style>