<template>
  <b-container>
    <b-row class="mt-3 mb-3">
      <b-list-group class="w-100">
        <b-list-group-item
          v-for="advancement of advancements"
          :key="advancement.id"
          class="d-flex justify-content-between align-items-center">
          <div>
            <div>
              <img :src="advancement.source.scannerConfig.iconUrl"/>
              {{ advancement.source.name }}
            </div>
            <div>
              chapitre: {{ advancement.chapter.number }}
              -
              page: {{ advancement.pageNumber }}
            </div>
          </div>
          <b-button @click="resume(advancement)">Continue <b-icon icon="chevron-right"></b-icon></b-button>
        </b-list-group-item>
      </b-list-group>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Advancement } from '@/models';

@Component
export default class MangaDetailAdvancement extends Vue {
  @Prop()
  advancements!: Advancement[];

  resume(adv: Advancement) {
    // contine
    this.$router.push(`/reader/${adv.chapter.id}/${adv.pageNumber}`);
  }
}
</script>

<style>

</style>