<template>
  <div class="home">
    <MangaList></MangaList>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import MangaList from '@/components/MangaList';

@Component({
  components: {
    MangaList
  }
})
export default class Home extends Vue {
  
}
</script>
