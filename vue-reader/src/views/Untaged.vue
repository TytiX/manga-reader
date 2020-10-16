<template>
  <div class="home">
    <AppNavBar title="Untaged"></AppNavBar>
    <div v-if="loaded"
      style="height: calc(100% - 56px);"
      class="scrollable">
      <MangaList
        :mangas="mangas"
        :favorites="favorites"
        :unread="unreadChapters"
        @fav="fav"
        @unfav="unfav"
        @load-more="loadNextPage">
      </MangaList>
    </div>
    <Loading v-else></Loading>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import Loading from '@/components/Loading.vue';
import MangaList from '@/components/MangaList.vue';
import { Manga } from '@/models';

@Component({
  components: {
    AppNavBar,
    Loading,
    MangaList
  }
})
export default class Untaged extends Vue {
  mangas: Manga[] = [];
  favorites: Manga[] = [];
  loaded = false;
  canLoadNext = false;
  unreadChapters = [];
  currentPage = 0;

  mounted() {
    this.loadPage(this.currentPage);
    this.reloadFavorites();
    this.unreadReload();
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.canLoadNext = false;
    if (page === 0) {
      this.loaded = false;
    }
    axios.get(`/api/manga/untaged`).then( response => {
      if (page === 0) {
        this.mangas = response.data;
      } else {
        this.mangas.push(...response.data);
      }
      this.loaded = true;
      setTimeout(() => {
        this.canLoadNext = true;
      }, 500);
    });
  }

  loadNextPage() {
    // if (this.canLoadNext === true) {
    //   this.loadPage(this.currentPage+1);
    // }
  }

  reloadFavorites() {
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.favorites = response.data;
    });
  }
  unreadReload() {
    axios.get('/api/manga/leftToRead/' + this.$currentProfile).then( response => {
      this.unreadChapters = response.data;
    });
  }
  fav(mangaId: string) {
    this.$addToFavorite(mangaId).then( () => {
      this.reloadFavorites();
    });
  }
  unfav(mangaId: string) {
    this.$removeFromFavorite(mangaId).then( () => {
      this.reloadFavorites();
    });
  }
}
</script>

<style lang="css" scoped>
.home {
  width: 100vw;
  height: 100vh;
}
.scrollable {
  overflow-y: auto;
}
</style>
