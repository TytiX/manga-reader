<template>
  <b-container>
    <b-row class="mt-3 mb-3">
      <b-col>
        <carousel
          :autoplay="true"
          :perPage="1">
          <slide v-for="cover of covers" :key="cover"
            class="img-cover">
            <b-img :src="cover"></b-img>
          </slide>
        </carousel>
      </b-col>
      <b-col class="chapter-desc">{{description}}</b-col>
    </b-row>
    <b-row>
      <b-col>
        <span class="tag" v-for="tag of tags" :key="tag.id">{{tag.name}}<b-icon class="ml-1" icon="x" @click="removeTag(tag)"></b-icon></span>
        <b-input-group class="mb-2">
          <v-select class="form-control style-chooser" v-model="selectedTag" label="name" :options="allTags"></v-select>
          <b-input-group-append>
            <b-button @click="addTag(selectedTag)">Add Tag</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Carousel, Slide } from 'vue-carousel';

import { Manga, Tag } from '@/models';

@Component({
  components: {
    Carousel,
    Slide
  }
})
export default class MangaDetailHeader extends Vue {
  @Prop()
  manga!: Manga;
  @Prop()
  allTags!: Tag[];

  selectedTag: Tag | null = null;

  covers: string[] = [];
  description = '';
  tags: Tag[] = [];

  created() {
    this.reinit();
  }
  @Watch('manga')
  mangaChange() {
    this.reinit();
  }

  reinit() {
    this.covers = this.manga.sources.filter( s => {
      return s.coverLink && this.isURL(s.coverLink);
    }).map( s => {
      return s.coverLink;
    }).map( s => {
      return `/api/image/fromUrl/${encodeURIComponent(s)}`;
    });
    if ( !this.covers || this.covers.length === 0 ) {
      this.covers = ['assets/no-cover.png'];
    }
    this.pickRandomDesc();
    this.tags = this.manga.tags;
  }

  isURL(str: string): boolean {
    const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    const url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }

  pickRandomDesc() {
    const sourceLength = this.manga.sources.length;
    const index = Math.floor( Math.random() * sourceLength );
    this.description = this.manga.sources[index].description;
  }

  addTag(tag: Tag) {
    this.$emit('add-tag', tag);
    this.selectedTag = null;
  }
  removeTag(tag: Tag) {
    this.$emit('remove-tag', tag);
  }

}
</script>

<style scoped>
.img-cover {
  width: auto;
  max-height: 350px;
}
.chapter-desc {
  max-height: 350px;
  overflow: auto;
}
.tag {
  background-color: #767676;
  border-radius: 0 2px 2px 0;
  color: #fff;
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2727272727;
  margin: 2px 4px 2px 10px;
  padding: 3px 7px;
  position: relative;
}
</style>
<style>
.style-chooser .vs__search::placeholder,
  .style-chooser .vs__dropdown-toggle,
  .style-chooser .vs__dropdown-menu {
    border: none;
  }

  .style-chooser .vs__clear,
  .style-chooser .vs__open-indicator,
  .style-chooser .vs__actions {
    padding: 0;
  }
</style>