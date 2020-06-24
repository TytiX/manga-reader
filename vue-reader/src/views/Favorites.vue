<template>
  <div>
    <AppNavBar title="Favoris"></AppNavBar>
    <div
      style="height: calc(100% - 56px);"
      class="scrollable">
      <MangaList
        :mangas="mangas"
        :favorites="mangas"
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
export default class Favorites extends Vue {
  mangas: Manga[] = [];
  mounted() {
    this.reloadFavorites();
  }
  reloadFavorites() {
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.mangas = response.data;
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

</style>