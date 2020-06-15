<template>
  <b-list-group class="w-100">
    <b-list-group-item
      v-for="config of configs"
      :key="config.id"
      :to="'/settings/' + config.id">
      <b-img :src="config.iconUrl"></b-img>
      {{config.name}}
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
}
</script>

<style>

</style>
