<template>
  <div v-if="loaded">
    <div>{{chapter.source.manga.name}} - {{chapter.source.name}} - {{chapter.number}}</div>
    <img v-for="page of chapter.pages" :key="page.id"  :src="page.url" :alt="page.number">
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import axios from 'axios';

import { Chapter, ScanSource } from '@/models';

@Component
export default class MangaReader extends Vue {
  @Prop()
  chapterId!: string;

  loaded = false;
  chapter!: Chapter;

  source!: ScanSource

  mounted() {
    axios.get<Chapter>('/api/chapter/' + this.chapterId).then( response => {
      this.chapter = response.data;
      this.loaded = true;

      this.getAllChaptersFromSource(this.chapter.source);
    });
  }

  getAllChaptersFromSource(source: ScanSource) {
    axios.get<ScanSource>('/api/source/' + source.id).then( response => {
      this.source = response.data;
      this.source.chapters.sort( (c1, c2) => { return c1.number - c2.number });
    });
  }

}
</script>

<style>

</style>
