<template>
  <div>
    <AppNavBar :title="manga ? manga.name : ''" back="true"></AppNavBar>
    <div v-if="manga.id !== ''">
      <b-container>
        <MangaDetailHeader :manga="manga"></MangaDetailHeader>
        <MangaDetailAdvancement></MangaDetailAdvancement>
        <MangaSourceChapters
          :manga="manga"
          @scan-chapters="scanChapters"
          @cache-chapters-on-server="cacheOnServer"
          @download-chapters="downloadChapters">
        </MangaSourceChapters>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import MangaDetailHeader from '@/components/details/MangaDetailHeader.vue';
import MangaDetailAdvancement from '@/components/details/MangaDetailAdvancement.vue';
import MangaSourceChapters from '@/components/details/MangaSourceChapters.vue';
import { Manga, Chapter } from '@/models';

@Component({
  components: {
    AppNavBar,
    MangaDetailHeader,
    MangaDetailAdvancement,
    MangaSourceChapters
  }
})
export default class Detail extends Vue {
  manga: Manga = {
    id: '',
    name: '',
    sources: []
  };

  mounted() {
    axios.get<Manga>('/api/manga/' + this.$route.params.id).then((res) => {
      this.manga = res.data;
    });
  }

  scanChapters(chapters: Chapter[]) {
    axios.post('/api/chapter/scan', chapters).then( () => {
      // scanning...
    });
  }
  cacheOnServer(chapters: Chapter[]) {
    this.$bvToast.toast(`Cannot cache chapter ${chapters.length}`, {
      title: `Cannot cache`,
      variant: 'danger'
    });
  }
  downloadChapters(chapters: Chapter[]) {
    this.$bvToast.toast(`Cannot download chapter ${chapters.length}`, {
      title: `Cannot download`,
      variant: 'danger'
    });
  }

  fav() {
    this.$addToFavorite(this.manga.id).then( () => {
      //
    });
  }
  unfav() {
    this.$removeFromFavorite(this.manga.id).then( () => {
      //
    });
  }
}
</script>

<style>

</style>