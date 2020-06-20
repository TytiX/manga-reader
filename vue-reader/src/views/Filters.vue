<template>
  <div>
    <AppNavBar title="Search"></AppNavBar>
    <TagList :tags="tags"></TagList>
    <!-- <MangaList
      :mangas="mangas"
      :favorites="mangas"
      @fav="fav"
      @unfav="unfav">
    </MangaList> -->
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import TagList from '@/components/TagList.vue';
import { Tag } from '@/models';

@Component({
  components: {
    AppNavBar,
    TagList
  }
})
export default class Favorites extends Vue {
  tags: Tag[] = [];
  mounted() {
    this.reloadTags();
  }
  reloadTags() {
    axios.get('/api/tag').then( response => {
      this.tags = response.data;
    });
  }
}
</script>

<style>

</style>