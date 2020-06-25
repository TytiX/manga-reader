<template>
  <div class="filter">
    <AppNavBar title="Search"></AppNavBar>
    <div
      style="height: calc(100% - 56px);"
      class="scrollable">
      <TagList v-if="tagLoaded"
        :tags="tags"
        @selected-tags="selectTags"></TagList>
      <Loading v-else></Loading>
      <MangaList v-if="loaded"
        :mangas="mangas"
        :favorites="favorites"
        @fav="fav"
        @unfav="unfav">
      </MangaList>
      <Loading v-else></Loading>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import Loading from '@/components/Loading.vue';
import TagList from '@/components/TagList.vue';
import MangaList from '@/components/MangaList.vue';
import { Tag, Manga } from '@/models';

@Component({
  components: {
    AppNavBar,
    Loading,
    TagList,
    MangaList
  }
})
export default class Favorites extends Vue {
  tags: Tag[] = [];
  mangas: Manga[] = [];
  favorites: Manga[] = [];

  selectedTags: Tag[] = [];
  tagLoaded = false;
  loaded = true;

  mounted() {
    this.reloadTags();
  }
  /***********************************************************
   * TAGS
   ***********************************************************/
  reloadTags() {
    this.tagLoaded = false;
    axios.get('/api/tag').then( response => {
      this.tags = response.data;
      this.tagLoaded = true;
    });
  }
  selectTags(tags: Tag[]) {
    this.selectedTags = tags;
    console.log(this.selectedTags);
    this.reloadMangas();
  }

  /***********************************************************
   * Mangas
   ***********************************************************/
  reloadMangas() {
    this.loaded = false;
    axios.post('/api/manga/search', { tags: this.selectedTags }).then( res => {
      this.mangas = res.data;
      this.loaded = true;
    });
  }

  /***********************************************************
   * Favorites
   ***********************************************************/
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

<style>
.filter {
  width: 100vw;
  height: 100vh;
}
.scrollable {
  overflow-y: auto;
}
</style>