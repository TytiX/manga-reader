<template>
  <div class="home">
    <AppNavBar title="Today"></AppNavBar>
    <div v-if="loaded"
      style="height: calc(100% - 56px);"
      class="scrollable">
      <MangaList
        :mangas="mangas"
        :favorites="favorites"
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
export default class Recents extends Vue {
  mangas: Manga[] = [];
  favorites: Manga[] = [];
  loaded = false;

  get timeFrame() {
    if (this.$route.path.endsWith('weekly')) {
      return '7-days';
    } else if (this.$route.path.endsWith('today')) {
      return '24-hours';
    }
    return '1-hour';
  }

  mounted() {
    this.loaded = false;
    axios.get(`/api/manga/latelly/${this.timeFrame}`).then( response => {
      this.mangas = response.data;
      this.loaded = true;
    });
    this.reloadFavorites();
  }

  reloadFavorites() {
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.favorites = response.data;
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
