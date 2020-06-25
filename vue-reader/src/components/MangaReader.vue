<template>
  <div>
    <div v-if="pages.length === 0">
      <h3>nothing...</h3>
    </div>
    <div v-else>
      <div v-if="readingMode === 'normal'">
        <v-zoomer-gallery
          style="width: 100vw; height: calc(100vh - 56px);"
          :list="pages"
          v-model="selIndex">
        </v-zoomer-gallery>
        
        <div class="back pad"
          @click="pageBack"></div>
        <div class="next pad"
          @click="pageNext"></div>
      </div>
      <div v-else-if="readingMode === 'vertical'"
        class="comic-strip">
        <b-button @click="chapterBack">Previous chapter</b-button>
        <ComicPage v-for="[index, page] of pageEntites"
          :key="page"
          :ref="index"
          :page="page"
          @page-show="visiblePage"
          class="page"/>
        <b-button @click="chapterNext">Next chapter</b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import ComicPage from './ComicPage.vue';

@Component({
  components: {
    ComicPage
  }
})
export default class MangaReader extends Vue {
  @Prop()
  pages!: string[];
  @Prop({default: 0})
  offset!: number;
  @Prop({default: 0})
  loadPageIndex!: number;
  selIndex = 0;
  @Prop({ default: 'normal' })
  readingMode!: string;

  mounted() {
    this.loadPageChanged();
  }

  @Watch('selIndex')
  pageChange() {
    this.$emit('page-change', this.selIndex);
  }
  @Watch('loadPageIndex')
  loadPageChanged() {
    this.selIndex = this.loadPageIndex;
    if (this.readingMode === 'vertical') {
      setTimeout( () => {
        this.scrollMeTo('' + this.selIndex);
      }, 1500);
    }
  }

  scrollMeTo(refName: string) {
    const element = this.$refs[refName];
    // eslint-disable-next-line
    const top = (element as any)[0].$el.offsetTop;
    // console.log(element);
    window.scrollTo(0, top);
  }

  get pageEntites() {
    return this.pages.entries()
  }

  visiblePage(page: string) {
    this.selIndex = this.pages.indexOf(page);
    this.$emit('page-change', this.selIndex);
  }

  pageBack() {
    if (this.selIndex > 0) {
      this.selIndex--;
    } else {
      this.chapterBack();
    }
  }
  pageNext() {
    if (this.selIndex < this.pages.length-1) {
      this.selIndex++;
    } else {
      this.chapterNext();
    }
  }
  chapterBack() {
    this.$emit('previous-chapter');
  }
  chapterNext() {
    this.$emit('next-chapter');
  }
}
</script>

<style>
.pad {
  height: calc(100% - 56px);
  width: 50px;
  position: absolute;
  top: 56px;
}
.back {
  /* background-color: blue; */
  left: 0;
}
.next {
  /* background-color: red; */
  right: 0;
}

.comic-strip {
  overflow-y: scroll;
  height: calc(100vh - 56px);
  background-color: rgb(51, 51, 51);
}
.page {
  width: 90%;
}
</style>
