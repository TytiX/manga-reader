<template>
  <div>
    <AppNavBar title="Favorites"></AppNavBar>
    <MangaList :mangas="mangas" :favorites="mangas"></MangaList>
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
    axios.get('/api/favorites/' + this.$currentProfile).then( response => {
      this.mangas = response.data;
    });
  }
}
</script>

<style>

</style>