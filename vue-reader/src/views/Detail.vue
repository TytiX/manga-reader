<template>
  <div class="detail">
    <AppNavBar :title="manga ? manga.name : ''" back="true" :showSetting="false"></AppNavBar>
    <div v-if="loaded"
      style="height: calc(100% - 56px);"
      class="scrollable">
      <b-container>
        <MangaDetailHeader :manga="manga"></MangaDetailHeader>
        <MangaDetailAdvancement
          :advancements="advancements"
          @delete-adv="deleteAdvancement"></MangaDetailAdvancement>
        <MangaSourceChapters
          :manga="manga"
          :isFavorite="isInFavorites"
          @fav="fav"
          @unfav="unfav"
          @read-mode="changeReadMode"
          @scan-chapters="scanChapters"
          @cache-chapters-on-server="cacheOnServer"
          @download-chapters="downloadChapters">
        </MangaSourceChapters>
      </b-container>
    </div>
    <Loading v-else></Loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';
import fs from 'bro-fs';

import AppNavBar from '@/components/AppNavBar.vue';
import Loading from '@/components/Loading.vue';
import MangaDetailHeader from '@/components/details/MangaDetailHeader.vue';
import MangaDetailAdvancement from '@/components/details/MangaDetailAdvancement.vue';
import MangaSourceChapters from '@/components/details/MangaSourceChapters.vue';
import { Manga, ScanSource, Chapter, Advancement } from '@/models';

@Component({
  components: {
    AppNavBar,
    Loading,
    MangaDetailHeader,
    MangaDetailAdvancement,
    MangaSourceChapters
  }
})
export default class Detail extends Vue {
  manga: Manga = {
    id: '',
    name: '',
    tags: [],
    sources: []
  };
  favorites: Manga[] = [];
  advancements: Advancement[] = [];
  loaded = false;

  mounted() {
    this.reload()
  }

  @Watch('$route.params.id')
  changeMangaId() {
    this.reload();
  }

  reload() {
    this.loaded = false;
    Promise.all([
      axios.get<Manga>(`/api/manga/${this.$route.params.id}`),
      axios.get<Advancement[]>(`/api/userprofile/${this.$currentProfile}/advancement/${this.$route.params.id}`),
      axios.get<Manga[]>('/api/favorites/' + this.$currentProfile)
    ]).then( values => {
      this.manga = values[0].data;
      this.advancements = values[1].data;
      this.favorites = values[2].data;
      this.loaded = true;
    })
  }

  get isInFavorites() {
    return this.favorites && this.favorites.findIndex(m => this.manga.id === m.id) != -1;
  }

  changeReadMode(source: ScanSource, mode: string) {
    // console.log(source, mode);
    axios.post(`/api/source/${source.id}/readmode`, {mode}).then( () => {
      // readmode changed
    });
  }

  deleteAdvancement(adv: Advancement) {
    axios.delete(`/api/advancement/${adv.id}`).then( () => {
      this.reload();
    });
  }

  scanChapters(chapters: Chapter[]) {
    axios.post('/api/chapter/scan', chapters).then( () => {
      // scanning...
    });
  }
  cacheOnServer(chapters: Chapter[]) {
    this.$bvToast.toast(`Cannot cache chapter ${chapters.length}`, {
      title: `Cannot cache`,
      variant: 'danger'
    });
  }
  downloadChapters(chapters: Chapter[]) {
    // this.$bvToast.toast(`Cannot download chapter ${chapters.length}`, {
    //   title: `Cannot download`,
    //   variant: 'danger'
    // });
    for (const chapter of chapters) {
      this.downloadChapterFiles(chapter);
    }
  }

  async downloadChapterFiles(chapter: Chapter) {
    await fs.init({type: (window as any).TEMPORARY, bytes: 200 * 1024 * 1024});
    const chapterFolder = chapter.source.manga.id + ' - ' + chapter.source.manga.name
                          + '/' + chapter.source.id + ' - ' + chapter.source.name
                          + '/' + chapter.id + ' - ' + chapter.name;
    await fs.mkdir(chapterFolder);

    const pagePromises = [];
    for (const page of chapter.pages) {
      const p = axios.get(`/api/image/${chapter.id}/${page.number}`, {
        responseType: 'arraybuffer'
      })
      .then(response => new Buffer(response.data, 'binary'))
      .then(async coverBuffer => {
        await fs.writeFile(`${chapterFolder}/${page.number}.png`, coverBuffer);
        const file = await fs.getEntry(`${chapterFolder}/${page.number}.png`);

        return {number: page.number, url: file.toURL()};
      });
      pagePromises.push(p);
    }
    Promise.all(pagePromises).then( (p) => {
      console.log(p)
    }).catch(e => {
      console.error(e);
    });
  }

  fav() {
    this.$addToFavorite(this.manga.id).then( () => {
      //
    });
  }
  unfav() {
    this.$removeFromFavorite(this.manga.id).then( () => {
      //
    });
  }
}
</script>

<style>
.detail {
  width: 100vw;
  height: 100vh;
}
.scrollable {
  overflow-y: auto;
}
</style>