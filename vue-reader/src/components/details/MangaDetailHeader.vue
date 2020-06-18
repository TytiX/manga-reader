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
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Manga } from '@/models';

@Component
export default class MangaDetailHeader extends Vue {
  @Prop()
  manga!: Manga;

  covers: string[] = [];
  description = '';

  created() {
    this.reinit();
  }
  @Watch('manga')
  mangaChange() {
    this.reinit();
  }

  reinit() {
    this.covers = this.manga.sources.map( s => {
      return s.coverLink;
    });
    this.pickRandomDesc();
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
</style>