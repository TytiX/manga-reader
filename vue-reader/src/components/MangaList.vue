<template>
  <div class="manga-list">
    <div v-for="manga of mangas" :key="manga.id">
      {{ manga.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';

import { Manga } from '@/models/Manga';

@Component
export default class MangaList extends Vue {
  mangas: Manga[] = [];

  mounted() {
    axios.get('/api/manga').then( response => {
      this.mangas = response.data;
    });
  }

}
</script>
