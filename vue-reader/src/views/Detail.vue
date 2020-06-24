<template>
  <div class="detail">
    <AppNavBar :title="manga ? manga.name : ''" back="true"></AppNavBar>
    <div v-if="manga.id !== ''"
      style="height: calc(100% - 56px);"
      class="scrollable">
      <b-container>
        <MangaDetailHeader :manga="manga"></MangaDetailHeader>
        <MangaDetailAdvancement :advancements="advancements"></MangaDetailAdvancement>
        <MangaSourceChapters
          :manga="manga"
          :isFavorite="isInFavorites"
          @fav="fav"
          @unfav="unfav"
          @read-mode="changeReadMode"
          @scan-chapters="scanChapters"
          @cache-chapters-on-server="cacheOnServer"
          @download-chapters="downloadChapters">
        </MangaSourceChapters>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import MangaDetailHeader from '@/components/details/MangaDetailHeader.vue';
import MangaDetailAdvancement from '@/components/details/MangaDetailAdvancement.vue';
import MangaSourceChapters from '@/components/details/MangaSourceChapters.vue';
import { Manga, ScanSource, Chapter, Advancement } from '@/models';

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
    tags: [],
    sources: []
  };
  favorites: Manga[] = [];
  advancements: Advancement[] = [];

  mounted() {
    this.reload()
  }

  @Watch('$route.params.id')
  changeMangaId() {
    this.reload();
  }

  reload() {
    axios.get<Manga>(`/api/manga/${this.$route.params.id}`).then((res) => {
      this.manga = res.data;
    });
    axios.get<Advancement[]>(`/api/userprofile/${this.$currentProfile}/advancement/${this.$route.params.id}`).then((res) => {
      this.advancements = res.data;
    });
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.favorites = response.data;
    });
  }

  get isInFavorites() {
    return this.favorites && this.favorites.findIndex(m => this.manga.id === m.id) != -1;
  }

  changeReadMode(source: ScanSource, mode: string) {
    // console.log(source, mode);
    axios.post(`/api/source/${source.id}/readmode`, {mode}).then( () => {
      // readmode changed
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
.detail {
  width: 100vw;
  height: 100vh;
}
.scrollable {
  overflow-y: auto;
}
</style>