<template>
  <b-container>
    <b-row class="mb-3">
      <b-form-select v-model="selectedSource" :options="optionsSources"></b-form-select>
    </b-row>
    <b-row class="mb-3">
      <b-button-group class="col" pill>
        <b-button
          @click.prevent="scanChapters(...chapters)"
          variant="warning">
          <b-icon icon="check2-circle"></b-icon>
        </b-button>
        <b-button
          @click.prevent="cacheOnServer(...chapters)">
          <b-icon icon="cloud-upload"></b-icon>
        </b-button>
        <b-button
          @click.prevent="downloadChapters(...chapters)">
          <b-icon icon="cloud-download"></b-icon>
        </b-button>
      </b-button-group>
      <div class="col">
        <b-button v-if="!isFavorite">
          <b-icon @click="fav()" icon="heart"></b-icon>
        </b-button>
        <b-button v-else>
          <b-icon @click="unfav()" icon="heart-fill"></b-icon>
        </b-button>
      </div>
    </b-row>
    <b-row class="mb-3">
      <b-list-group class="chapter-list w-100">
        <b-list-group-item
          v-for="chapter of chapters"
          :key="chapter.id"
          :to="chapter.scanned ? '/reader/'+chapter.id : ''"
          class="d-flex justify-content-between align-items-center">
          {{ chapter.number }} - {{ chapter.name }}
          <b-button-group size="sm" pill>
            <b-button
              @click.prevent="scanChapters(chapter)"
              :variant="chapterScanStatus(chapter)">
              <b-icon :icon="chapterIconStatus(chapter)"></b-icon>
            </b-button>
            <b-button
              @click.prevent="cacheOnServer(chapter)">
              <b-icon icon="cloud-upload"></b-icon>
            </b-button>
            <b-button
              @click.prevent="downloadChapters(chapter)">
              <b-icon icon="cloud-download"></b-icon>
            </b-button>
          </b-button-group>
        </b-list-group-item>
      </b-list-group>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Manga, ScanSource, Chapter } from '@/models';

@Component
export default class MangaDetailHeader extends Vue {
  @Prop()
  manga!: Manga;
  @Prop({ default: false })
  isFavorite!: boolean;

  chapters: Chapter[] = [];
  optionsSources: { value: ScanSource; text: string }[] = [];
  selectedSource!: ScanSource;

  created() {
    this.reinit();
  }
  @Watch('manga')
  mangaChange() {
    this.reinit();
  }
  @Watch('selectedSource')
  changeScanSource() {
    this.reloadChapters();
  }

  reinit() {
    this.optionsSources = this.manga.sources.map( s => {
      return { value: s, text: s.name };
    });
    this.selectedSource = this.manga.sources[0];
    this.reloadChapters();
  }

  reloadChapters() {
    if (this.selectedSource) {
      this.chapters = this.selectedSource.chapters.sort( (c1, c2) => { return  c2.number - c1.number } );
    }
  }

  chapterScanStatus(chapter: Chapter) {
    return chapter.scanned ? 'success' : 'warning'
  }
  chapterIconStatus(chapter: Chapter) {
    return chapter.scanned ? 'check2-circle' : 'arrow-repeat'
  }

  scanChapters(...chapters: Chapter[]) {
    this.$emit('scan-chapters', chapters);
  }
  cacheOnServer(...chapters: Chapter[]) {
    this.$emit('cache-chapters-on-server', chapters);
  }
  downloadChapters(...chapters: Chapter[]) {
    this.$emit('download-chapters', chapters);
  }

}
</script>

<style>

</style>