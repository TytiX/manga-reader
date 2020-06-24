<template>
  <div class="filter">
    <AppNavBar title="Search"></AppNavBar>
    <div
      style="height: calc(100% - 56px);"
      class="scrollable">
      <TagList
        :tags="tags"
        @selected-tags="selectTags"></TagList>
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
import TagList from '@/components/TagList.vue';
import MangaList from '@/components/MangaList.vue';
import { Tag, Manga } from '@/models';

@Component({
  components: {
    AppNavBar,
    TagList,
    MangaList
  }
})
export default class Favorites extends Vue {
  tags: Tag[] = [];
  mangas: Manga[] = [];
  favorites: Manga[] = [];

  selectedTags: Tag[] = [];

  mounted() {
    this.reloadTags();
  }
  reloadTags() {
    axios.get('/api/tag').then( response => {
      this.tags = response.data;
    });
  }
  reloadFavorites() {
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.favorites = response.data;
    });
  }

  reloadMangas() {
    axios.post('/api/manga/search', { tags: this.selectedTags }).then( res => {
      this.mangas = res.data;
    });
  }

  selectTags(tags: Tag[]) {
    this.selectedTags = tags;
    console.log(this.selectedTags);
    this.reloadMangas();
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