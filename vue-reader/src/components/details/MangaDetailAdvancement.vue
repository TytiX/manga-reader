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
              page: {{ advancement.page }}
            </div>
          </div>
          <b-button @click="resume(advancement)">Continue <b-icon icon="chevron-right"></b-icon></b-button>
        </b-list-group-item>
      </b-list-group>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Manga, ScanSource, Chapter } from '@/models';

@Component
export default class MangaDetailAdvancement extends Vue {
  advancements: any[] = [{
    id: '1',
    source: {
      name: 'scanfr',
      scannerConfig: {
        iconUrl: 'https://www.scan-vf.co/uploads/favicon.png'
      }
    },
    chapter: {
      id: '',
      number: 40
    },
    page: 10
  }];

  mounted() {
    // TODO:
  }

  resume(a: any) {
    // TODO: contine
  }
}
</script>

<style>

</style>