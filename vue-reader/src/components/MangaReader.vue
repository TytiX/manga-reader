<template>
  <div>
    <v-zoomer-gallery
      style="width: 100vw; height: 100vh;"
      :list="pages"
      v-model="selIndex">
    </v-zoomer-gallery>
    
    <div class="back pad"
      @click="pageBack"></div>
    <div class="next pad"
      @click="pageNext"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component
export default class MangaReader extends Vue {
  @Prop()
  pages!: string[];
  @Prop({default: 0})
  offset!: number;
  selIndex = 0;

  @Watch('selIndex')
  pageChange() {
    this.$emit('page-change', this.selIndex);
  }

  pageBack() {
    if (this.selIndex > 0) {
      this.selIndex--;
    } else {
      this.$emit('previous-chapter')
    }
  }
  pageNext() {
    if (this.selIndex < this.pages.length-1) {
      this.selIndex++;
    } else {
      this.$emit('next-chapter');
    }
  }
}
</script>

<style>
.pad {
  height: 100%;
  width: 50px;
  position: absolute;
  top: 0;
}
.back {
  /* background-color: blue; */
  left: 0;
}
.next {
  /* background-color: red; */
  right: 0;
}
</style>
