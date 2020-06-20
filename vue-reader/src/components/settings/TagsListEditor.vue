<template>
  <div>
    <AppNavBar title="Manage Tags" back="true"></AppNavBar>
    <b-container class="align-l">
      <b-row>
        <b-button variant="success" @click="saveTags">Save</b-button>
      </b-row>
      <b-row>
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
import { Tag } from '@/models/Tag';

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
    axios.get('/api/tag').then( res => {
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
}
</script>

<style>
.align-l {
  text-align: left;
}
</style>