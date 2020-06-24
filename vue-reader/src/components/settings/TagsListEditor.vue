<template>
  <div style="width: 100vw; height: 100vh;">
    <AppNavBar title="Manage Tags" back="true" :showSetting="false">
        <b-nav-item @click="saveTags"><b-icon icon="file-earmark-arrow-down"></b-icon></b-nav-item>
    </AppNavBar>
    <div style="height: calc(100% - 56px);" class="scrollable">
      <b-container class="align-l">
        <!-- <b-row>
          <b-button variant="success" @click="saveTags">Save</b-button>
        </b-row> -->
        <b-row class="mt-3 mb-3">
          <b-list-group class="w-100">
            <b-list-group-item v-for="tag of tags" :key="tag.id">
              <b-row>
                <b-input class="col-6" type="text" v-model="tag.name"></b-input>
                <draggable class="col-6 list-group" :list="tag.values" group="people">
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
  tags: Tag[] = [];

  mounted() {
    this.realoadTags();
  }

  realoadTags() {
    axios.get('/api/tag/values').then( res => {
      this.tags = res.data;
    });
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