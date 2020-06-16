<template>
  <div class="manga-detail">
    <b-container>
      <b-row class="mt-3 mb-3">
        <b-col>
          <b-carousel indicators>
            <b-carousel-slide v-for="cover of covers" :key="cover"
              :img-src="cover"
            ></b-carousel-slide>
          </b-carousel>
        </b-col>
        <b-col>{{selectedSource.description}}</b-col>
      </b-row>
      <b-row class="mb-3">
        <b-form-select v-model="selectedSource" :options="optionsSources"></b-form-select>
      </b-row>
      <b-row class="mb-3">
        <b-list-group class="chapter-list w-100">
          <b-list-group-item
            v-for="chapter of chapters"
            :key="chapter.id"
            :to="'/reader/'+chapter.id"
            class="d-flex justify-content-between align-items-center"
            disable>
            {{ chapter.number }} - {{ chapter.name }}
            <b-button-group size="sm" pill>
              <b-button @click.prevent="scanChapter(chapter)" :variant="chapterScanStatus(chapter)"><b-icon :icon="chapterIconStatus(chapter)"></b-icon></b-button>
              <b-button @click.prevent="cacheOnServer(chapter)"><b-icon icon="cloud-upload"></b-icon></b-button>
              <b-button @click.prevent="downloadChapter(chapter)"><b-icon icon="cloud-download"></b-icon></b-button>
            </b-button-group>
          </b-list-group-item>
        </b-list-group>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import axios from 'axios';

import { Manga, ScanSource, Chapter } from '@/models';

@Component
export default class MangaDetail extends Vue {
  @Prop()
  manga!: Manga;

  optionsSources: { value: ScanSource; text: string }[] = [];

  selectedSource!: ScanSource;

  covers: string[] = [];
  descriptions: string[] = [];
  chapters: Chapter[] = [];

  created() {
    this.optionsSources = this.manga.sources.map( s => {
      return { value: s, text: s.name };
    });
    this.selectedSource = this.manga.sources[0];

    this.reloadChapters();

    this.covers = this.manga.sources.map( s => {
      return s.coverLink;
    })
  }

  @Watch('selected')
  changeScanSource() {
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

}
</script>
