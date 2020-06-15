<template>
  <div>
    <AppNavBar :title="manga ? manga.name : ''"></AppNavBar>
    <div v-if="manga.id !== ''">
      <MangaDetail :manga="manga"></MangaDetail>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import MangaDetail from '@/components/MangaDetail.vue';
import { Manga } from '../models';

@Component({
  components: {
    AppNavBar,
    MangaDetail
  }
})
export default class Detail extends Vue {
  manga: Manga = {
    id: '',
    name: '',
    sources: []
  };

  mounted() {
    axios.get<Manga>('/api/manga/' + this.$route.params.id).then((res) => {
      this.manga = res.data;
    });
  }
}
</script>

<style>

</style>