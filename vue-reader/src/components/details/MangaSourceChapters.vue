<template>
  <b-container>
    <b-row class="mb-3">
      <b-form-select v-model="selectedSource" :options="optionsSources"></b-form-select>
    </b-row>

    <b-row class="mb-3">
      <b-button-group class="col-5" pill>
        <b-button
          @click.prevent="scanChapters(...allChaptersClean)"
          variant="warning">
          <b-icon icon="check2-circle"></b-icon>
        </b-button>
        <!-- <b-button
          @click.prevent="cacheOnServer(...chapters)">
          <b-icon icon="cloud-upload"></b-icon>
        </b-button> -->
        <b-button
          @click.prevent="downloadChapters(...chapters)">
          <b-icon icon="cloud-download"></b-icon>
        </b-button>
      </b-button-group>
      <div class="col-5">
        <b-form-select v-model="selectedSource.reading" :options="readingOptions"></b-form-select>
      </div>
      <div class="col-2">
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
          class="d-flex">
          <div class="flex w-100">
            <div>{{ chapter.number }} - {{ chapter.name }}</div>
            <small>{{ chapter.createDate | date }}</small>
          </div>
          <b-button-group size="sm" pill>
            <b-button
              @click.prevent="scanChapters(chapter)"
              :variant="chapterScanStatus(chapter)">
              <b-icon :icon="chapterIconStatus(chapter)"></b-icon>
            </b-button>
            <!-- <b-button
              @click.prevent="cacheOnServer(chapter)">
              <b-icon icon="cloud-upload"></b-icon>
            </b-button> -->
            <b-button
              @click.prevent="downloadChapters(chapter)"
              :disabled="!chapter.scanned">
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

@Component({
  filters: {
    'date': (value: Date) => {
      return new Date(value).toLocaleString();
    }
  }
})
export default class MangaSourceChapters extends Vue {
  @Prop()
  manga!: Manga;
  @Prop({ default: false })
  isFavorite!: boolean;

  chapters: Chapter[] = [];

  selectedSource: ScanSource = {
    id: '',
    name: '',
    link: '',
    coverLink: '',
    description: '',
    reading: 'normal',
    manga: {
      id: '',
      name: '',
      tags: [],
      sources: []
    },
    scannerConfig: {
      id: ''
    },
    chapters: []
  };
  optionsSources: { value: ScanSource; text: string }[] = [];
  readingOptions = [
    {value: 'normal', text: 'normal'},
    {value: 'vertical', text: 'vertical'}
  ];

  created() {
    this.reinit();
  }

  @Watch('manga')
  mangaChange() {
    this.reinit();
  }
  @Watch('selectedSource.reading')
  changeReadMode() {
    this.$emit('read-mode', this.selectedSource, this.selectedSource.reading);
    this.reloadChapters();
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

  get allChaptersClean() {
    return this.chapters.map( (c: Chapter) => {
      return {
        id: c.id,
        link: c.link,
        name: c.name,
        number: c.number,
        pages: null,
        scanned: c.scanned,
        // createDate: c.createDate,
        // updateDate: c.updateDate
      }
    });
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
    for (const chapter of chapters) {
      chapter.source = this.selectedSource;
      chapter.source.manga = this.manga;
    }
    this.$emit('download-chapters', chapters);
  }

  fav() {
    this.$emit('fav')
  }
  unfav() {
    this.$emit('unfav')
  }

}
</script>

<style>
.chapter-list {
  text-align: left;
}
</style>