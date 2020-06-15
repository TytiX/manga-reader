<template>
  <div class="home">
    <AppNavBar title="All"></AppNavBar>
    <MangaList
      :mangas="mangas"
      :favorites="favorites"></MangaList>
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
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.favorites = response.data;
    });
  }
}
</script>
