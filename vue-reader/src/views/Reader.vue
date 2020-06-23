<template>
  <div>
    <b-navbar type="dark" variant="dark">
      <b-navbar-brand v-if="loaded" class="manga-title">
        {{chapter.source.manga.name}} 
      </b-navbar-brand>
      <b-navbar-brand v-if="loaded">
        - chapter {{chapter.number}} - {{page + 1}} / {{pages.length}}
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-item @click="closeReader"><b-icon icon="x"></b-icon></b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <MangaReader
      :pages="pages"
      :loadPageIndex="loadPage"
      @next-chapter="nextChapter"
      @previous-chapter="previousChapter"
      @page-change="pageChanged">
    </MangaReader>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
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
  page = 0;
  pages: string[] = [];
  loadPage = 0;
  loaded = false;

  mounted() {
    this.loadChapter();
  }
  @Watch('$route.params.chapterId')
  chapterIdChange() {
    this.loadChapter();
  }

  loadChapter() {
    axios.get<Chapter>('/api/chapter/' + this.$route.params.chapterId).then( response => {
      this.chapter = response.data;
      this.loadPage = this.$route.params.page ? Number(this.$route.params.page) : 0;
      this.pages = this.chapter.pages.map(p => p.url);
      this.pageChanged(this.loadPage);
      this.loaded =true;
    });
  }

  nextChapter() {
    axios.get<Chapter>('/api/chapter/' + this.$route.params.chapterId + '/next').then( response => {
      this.changeChapter(response.data.id)
    });
  }
  previousChapter() {
    axios.get<Chapter>('/api/chapter/' + this.$route.params.chapterId + '/previous').then( response => {
      this.changeChapter(response.data.id)
    });
  }

  pageChanged(pageNum: number) {
    this.page = pageNum;
    // send new advencement
    this.$sendAdvancement(this.chapter.source.id, this.$route.params.chapterId, pageNum).then( () => {
        // nothing
    });
  }
  changeChapter(chapterId: string) {
    this.$router.back();
    setTimeout( () => {
      this.$router.push('/reader/' + chapterId);
    }, 50);
  }
  closeReader() {
    this.$router.back();
  }
}
</script>

<style>
.manga-title {
  max-width: calc( 100% - 183px - 16px - 36px);
  /* width: calc( 100% - 183px - 16px - 36px); */
  overflow: hidden;
  text-overflow: ellipsis;
}
.close {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>