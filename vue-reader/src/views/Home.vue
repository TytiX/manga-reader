<template>
  <div class="home">
    <AppNavBar title="Mangas"></AppNavBar>
    <div
      style="height: calc(100% - 56px);"
      class="scrollable">
      <MangaList
        :mangas="mangas"
        :favorites="favorites"
        @fav="fav"
        @unfav="unfav">
      </MangaList>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import MangaList from '@/components/MangaList.vue';
import { Manga } from '@/models';

@Component({
  components: {
    AppNavBar,
    MangaList
  }
})
export default class Home extends Vue {
  mangas: Manga[] = [];
  favorites: Manga[] = [];
  mounted() {
    axios.get('/api/manga').then( response => {
      this.mangas = response.data;
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
