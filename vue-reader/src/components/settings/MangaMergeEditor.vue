<template>
  <div style="width: 100vw; height: 100vh;">
    <AppNavBar title="Manage Tags" back="true" :showSetting="false"></AppNavBar>
    <b-container style="height: calc(100% - 56px);">
      <b-row style="height: 100%">
        <b-list-group class="scrollable h-100 w-100">
          <b-list-group-item
            v-for="manga of mangas"
            :key="manga.from.id"
            @click="mergeManga(manga)">
            {{manga.from.name}} >> {{manga.to.name}}
          </b-list-group-item>
        </b-list-group>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';

@Component({
  components: {
    AppNavBar
  }
})
export default class MangaMergeEditor extends Vue {
  mangas: {
    from: { id: string; name: string };
    to: { id: string; name: string };
  }[] = [];

  mounted() {
    this.reloadMangas();
  }

  reloadMangas() {
    axios.get('/api/manga/simili').then( res => {
      // eslint-disable-next-line
      this.mangas = res.data.map( (m: any) => {
        return {
          from : {
            id: m.m1_id,
            name: m.m1_name
          },
          to : {
            id: m.m2_id,
            name: m.m2_name
          }
        }
      });
    });
  }
  // eslint-disable-next-line
  mergeManga(manga: any) {
    axios.post('/api/manga/migrateSources', manga).then( res => {
      //
      console.log(res);
      this.reloadMangas();
    });
  }
}
</script>

<style>
.scrollable {
  overflow-y: auto;
}
</style>