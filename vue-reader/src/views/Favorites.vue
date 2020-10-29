<template>
  <div class="favorites">
    <AppNavBar title="Favoris"></AppNavBar>
    <div v-if="loaded"
      style="height: calc(100% - 56px);"
      class="scrollable">
      <MangaList
        :mangas="mangas"
        :favorites="mangas"
        :unread="unreadChapters"
        :unreadFirst="true"
        @fav="fav"
        @unfav="unfav">
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
export default class Favorites extends Vue {
  mangas: Manga[] = [];
  loaded = false;
  unreadChapters = [];

  mounted() {
    this.reloadFavorites();
  }
  reloadFavorites() {
    this.loaded = false;
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.mangas = response.data;
      this.loaded = true;
    });
    this.unreadReload();
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

<style>
.favorites {
  width: 100vw;
  height: 100vh;
}
.scrollable {
  overflow-y: auto;
}
</style>