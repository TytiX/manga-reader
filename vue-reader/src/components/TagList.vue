<template>
  <div>

    <!-- <b-form-group label="Button-group style checkboxes">
      <b-form-checkbox-group
        v-model="selected"
        :options="options"
        buttons
      ></b-form-checkbox-group>
    </b-form-group> -->

    <span
      class="tag"
      v-for="tag of tags"
      :key="tag.id"
      :class="btnColor(tag)"
      @click="tagClicked(tag)">
      {{tag.name}}
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { Tag } from '@/models';

@Component
export default class TagList extends Vue {
  @Prop()
  tags!: Tag[];

  options: { text: string; value: Tag }[] = [];
  selected: Tag[] = [];

  @Watch('tags')
  changeTags() {
    this.options = this.tags.map(t => {
      return {
        text: t.name,
        value: t
      };
    });
  }

  isInSelection(tag: Tag) {
    return this.selected.findIndex( t => t.id === tag.id ) !== -1;
  }

  tagClicked(tag: Tag) {
    if (this.isInSelection(tag)) {
      // remove from selected
      const i = this.selected.findIndex( t => t.id === tag.id );
      this.selected.splice(i, 1);
    } else {
      // add to selection
      this.selected.push(tag);
    }
  }

  @Watch('selected')
  select() {
    // console.log(this.selected);
    this.$emit('selected-tags', this.selected);
  }

  btnColor(tag: Tag) {
    return this.isInSelection(tag) ? 'btn-success' : 'btn-secondary';
  }

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