<template>
  <b-img
    :src="page"
    v-b-visible="visibleHandler">
  </b-img>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class ComicPage extends Vue {
  @Prop()
  page!: string;

  visibleHandler(visible: boolean) {
    if (visible) {
      this.$emit('page-show', this.page);
    }
  }
}
</script>

<style>

</style>