<template>
  <b-img
    :src="page"
    @load="loaded"
    v-b-visible="visibleHandler">
  </b-img>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class ComicPage extends Vue {
  @Prop()
  page!: string;

  load = false;
  visible = false;

  visibleHandler(visible: boolean) {
    this.visible = visible;
    if (visible && this.load) {
      this.send();
    }
  }
  loaded() {
    this.load = true;
    if (this.visible) {
      this.send();
    }
  }
  send() {
    this.$emit('page-show', this.page);
  }
}
</script>

<style>

</style>