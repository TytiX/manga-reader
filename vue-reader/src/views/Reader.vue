<template>
  <div>
    <MangaReader :chapterId="$route.params.chapterId"></MangaReader>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import MangaReader from '@/components/MangaReader.vue';

@Component({
  components: {
    MangaReader
  }
})
export default class Reader extends Vue {
  
}
</script>

<style>

</style>