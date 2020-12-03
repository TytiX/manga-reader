<template>
  <b-list-group class="w-100">
    <b-list-group-item
      v-for="config of configs"
      :key="config.id"
      :to="'/settings/' + config.id">
      <b-img heigth="50" width="50" rounded="circle" :src="getImg(config.iconUrl)"></b-img>
      {{config.name}}
      <div>
        <b-button variant="danger" @click.prevent="deleteConfig(config.id)"><b-icon icon="trash"></b-icon></b-button>
      </div>
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { ScannerConfig } from '@/models';

@Component
export default class ConfigurationList extends Vue {
  @Prop()
  configs!: ScannerConfig[];

  getImg(url: string) {
    return `/api/image/fromUrl/${encodeURIComponent(url)}`;
  }

  deleteConfig(id: string) {
    this.$emit('deleteClicked', id);
  }
}
</script>

<style>

</style>
