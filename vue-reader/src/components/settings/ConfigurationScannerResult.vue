<template>
  <div>
    <Loading v-if="loading"></Loading>
    <div v-else>
      <div v-if="scanResult.mangas">

        <div class="found-manga">Found mangas : {{scanResult.mangas.length}}</div>
        <div class="scrolling-container">
          <div v-for="(manga, index) of scanResult.mangas" :key="manga.link">{{ index }} -- {{ manga.name }}</div>
        </div>

        <div class="scrolling-container">
          {{scanResult.tags}}
          <!-- <div v-for="tag of scanResult.tags" :key="tag">{{tag}}</div> -->
        </div>

        <b-form-select v-model="mangaIndex" :options="mangaOptions" size="sm" class="mt-3"></b-form-select>

        <div v-if="mangaIndex > -1 && scanResult.source">

          <div>
            <h2>{{scanResult.source.manga.name}}</h2>
            <b-img :src="scanResult.source.coverLink"></b-img>
            <p class="scrolling-container">{{scanResult.source.description}}</p>
            <div class="scrolling-container">
              <div
                v-for="chapter of scanResult.source.chapters"
                :key="chapter.link">
                {{chapter.number}} - {{chapter.link}}
              </div>
            </div>
          </div>

          <b-form-select v-model="selectedChapter" :options="chapterOptions" size="sm" class="mt-3"></b-form-select>
          <Loading v-if="loadingChapters"></Loading>
          <div v-else class="scrolling-container">
            {{scannerChapter}}
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import Loading from '@/components/Loading.vue';
import { Manga, Chapter } from '@/models';

@Component({
  components: {
    Loading
  }
})
export default class ConfigurationScannerResult extends Vue {
  @Prop()
  loading = false;
  @Prop() // eslint-disable-next-line
  scanResult!: any;
  @Prop()
  loadingChapters = false;
  @Prop() // eslint-disable-next-line
  scannerChapter!: any;

  selectedChapter: any = {};
  mangaIndex = -1;

  get mangaOptions() {
    return this.scanResult.mangas.map((m: Manga, index: number) => {
      return {
        value: index,
        text: index + ' - ' + m.name
      }
    });
  }
  get chapterOptions() {
    return this.scanResult.source.chapters.map((c: Chapter) => {
      return {
        value: c,
        text: c.number + ' - ' + c.name
      }
    })
  }

  @Watch('mangaIndex')
  changeMangaIndex() {
    this.$emit('load-manga-index', this.mangaIndex);
  }
  @Watch('selectedChapter')
  changeChapterScan() {
    this.$emit('load-scan-chapter', this.selectedChapter);
  }
}
</script>

<style>
.found-manga {
  border: 1px solid;
}
.scrolling-container {
  max-height: 200px;
  overflow-y: auto;
}
</style>