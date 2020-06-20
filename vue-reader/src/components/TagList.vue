<template>
  <div>
    <span
      class="tag"
      v-for="tag of tags"
      :key="tag.id">
      {{tag.name}}
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { Tag } from '@/models';

@Component
export default class TagList extends Vue {
  @Prop()
  tags!: Tag[];
}
</script>

<style>
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