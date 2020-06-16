<template>
  <div>
    <MangaReader
      :pages="pages"
      @next-chapter="nextChapter"
      @previous-chapter="previousChapter"
      @page-change="pageChanged">
    </MangaReader>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';

import MangaReader from '@/components/MangaReader.vue';
import { Chapter } from '@/models';

@Component({
  components: {
    MangaReader
  }
})
export default class Reader extends Vue {
  chapter!: Chapter;
  pages: string[] = [];

  mounted() {
    axios.get<Chapter>('/api/chapter/' + this.$route.params.chapterId).then( response => {
      this.chapter = response.data;
      this.pages = this.chapter.pages.map(p => p.url);
    });
  }

  nextChapter() {
    // TODO: 
  }
  previousChapter() {
    // TODO: 
  }

  pageChanged() {
    // TODO: send new advencement
  }
}
</script>

<style>

</style>