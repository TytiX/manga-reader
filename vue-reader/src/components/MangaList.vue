<template>
  <b-container class="manga-list">
    <b-row>
      <b-col cols="4" sm="4" md="2"
        v-for="manga of mangas"
        :key="manga.id">
        <router-link
          :to="'/manga/' + manga.id">
          <MangaListItem
            :manga="manga"
            :isFavorite="isInFavorites(manga)"
            @fav="fav"
            @unfav="unfav">
          </MangaListItem>
        </router-link>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import MangaListItem from '@/components/MangaListItem.vue';
import { Manga } from '@/models';

@Component({
  components: {
    MangaListItem
  }
})
export default class MangaList extends Vue {
  @Prop()
  mangas!: Manga[];
  @Prop()
  favorites?: Manga[];

  isInFavorites(manga: Manga) {
    return this.favorites && this.favorites.findIndex(m => manga.id === m.id) != -1;
  }
  fav(mangaId: string) {
    this.$emit('fav', mangaId);
  }
  unfav(mangaId: string) {
    this.$emit('unfav', mangaId);
  }
}
</script>

<style scoped>

</style>
