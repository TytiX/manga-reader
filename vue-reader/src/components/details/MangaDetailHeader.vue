<template>
  <b-container>
    <b-row class="mt-3 mb-3">
      <b-col>
        <b-carousel
          class="chapter-covers"
          indicators>
          <b-carousel-slide v-for="cover of covers" :key="cover"
            :img-src="cover"
            class="img-cover"
            fluid>
          </b-carousel-slide>
        </b-carousel>
      </b-col>
      <b-col class="chapter-desc">{{description}}</b-col>
    </b-row>
    <b-row>
      <b-col>
        <span class="tag" v-for="tag of tags" :key="tag.id">{{tag.name}}</span>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Manga, Tag } from '@/models';

@Component
export default class MangaDetailHeader extends Vue {
  @Prop()
  manga!: Manga;

  covers: string[] = [];
  description = '';
  tags: Tag[] = [];

  created() {
    this.reinit();
  }
  @Watch('manga')
  mangaChange() {
    this.reinit();
  }

  reinit() {
    this.covers = this.manga.sources.filter( s => {
      return s.coverLink && this.isURL(s.coverLink);
    }).map( s => {
      return s.coverLink;
    });
    if ( !this.covers || this.covers.length === 0 ) {
      this.covers = ['assets/no-cover.png'];
    }
    this.pickRandomDesc();
    this.tags = this.manga.tags;
  }

  isURL(str: string): boolean {
    const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    const url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }

  pickRandomDesc() {
    const sourceLength = this.manga.sources.length;
    const index = Math.floor( Math.random() * sourceLength );
    this.description = this.manga.sources[index].description;
  }

}
</script>

<style>
.img-cover {
  width: auto;
  max-height: 350px;
}
.chapter-desc {
  max-height: 350px;
  overflow: auto;
}
.tag {
  background-color: #767676;
  border-radius: 0 2px 2px 0;
  color: #fff;
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2727272727;
  margin: 2px 4px 2px 10px;
  padding: 3px 7px;
  position: relative;
}
</style>