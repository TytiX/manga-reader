<template>
  <div style="width: 100vw; height: 100vh;">
    <AppNavBar title="Manage Tags" back="true" :showSetting="false">
        <b-nav-item @click="saveTags"><b-icon icon="file-earmark-arrow-down"></b-icon></b-nav-item>
    </AppNavBar>
    <b-container class="align-l" style="height: calc(100% - 56px - 2rem);">
      <b-row class="mt-3 mb-3" style="height: 100%">
        <!-- Values -->
        <draggable class="col-6 list-group scrollable h-100"
          :list="values"
          :group="{ name: 'people', clone: 'clone', put: false }">
          <div class="list-group-item"
            v-for="value of values"
            :key="'value-' + value.id">
            {{value.value}}
          </div>
        </draggable>
        <!-- Tags -->
        <b-list-group class="col-6 scrollable h-100">
          <b-list-group-item v-for="tag of tags" :key="tag.id">
            <b-row>
              <b-input class="col-6" type="text" v-model="tag.name"></b-input>
              <draggable class="col-6 list-group"
                :list="tag.values"
                @add="dropValue(tag)"
                group="people">
                <div
                  class="list-group-item"
                  v-for="value of tag.values"
                  :key="tag.id + '-' + value.id">
                  {{value.value}}
                  <i @click="deleteValueFromTag(tag, value)"><b-icon icon="x"></b-icon></i>
                </div>
              </draggable>
            </b-row>
          </b-list-group-item>
        </b-list-group>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';
import draggable from 'vuedraggable'

import AppNavBar from '@/components/AppNavBar.vue';
import { Tag, TagValue } from '@/models';

@Component({
  components: {
    draggable,
    AppNavBar
  }
})
export default class TagsListEditor extends Vue {
  values: TagValue[] = [];
  tags: Tag[] = [];

  mounted() {
    this.realoadTags();
  }

  realoadTags() {
    axios.get('/api/tag/values').then( res => {
      this.tags = res.data;
      this.values = [];
      for (const tag of this.tags) {
        this.values.push(...tag.values);
      }
    });
  }

  dropValue(tag: Tag) {
    // cleanupOtherTags
    const tagsToClean: Tag[] = this.tags.filter(t => {
      return t.id !== tag.id;
    });
    for (const t of tagsToClean) {
      for (const v of tag.values) {
        const delIndex = t.values.findIndex((val) => val.id === v.id);
        if (delIndex > -1) {
          console.log('find in', t);
          t.values.splice(delIndex, 1);
        }
      }
    }
  }

  saveTags() {
    console.log(this.tags);
    axios.post('/api/tag', this.tags).then( () => {
      axios.get('/api/tag/cleanup').then( () => {
        this.realoadTags();
      });
    });
  }

  deleteValueFromTag(tag: Tag, value: TagValue) {
    const index = tag.values.findIndex(v => v.id === value.id);
    if (index > -1) {
      tag.values.splice(index, 1);
    }
  }
}
</script>

<style>
.scrollable {
  overflow-y: auto;
}
.align-l {
  text-align: left;
}
</style>