<template>
  <div>
    <b-navbar type="dark" variant="dark">
      <b-navbar-nav>
        <b-nav-item v-if="!back" v-b-toggle.sidebar-1><b-icon icon="list"></b-icon></b-nav-item>
        <b-nav-item v-else @click="$router.back()"><b-icon icon="arrow-left-short"></b-icon></b-nav-item>
      </b-navbar-nav>

      <b-navbar-brand class="bar-title">{{title}}</b-navbar-brand>

      <b-navbar-nav class="ml-auto">
        <b-nav-form v-if="enableSearch">
          <b-form-input size="sm" class="mr-sm-2"
            placeholder="Search"
            v-model="searchText">
          </b-form-input>
        </b-nav-form>
        <b-nav-item v-show="showSetting" to="/settings"><b-icon icon="gear"></b-icon></b-nav-item>
        <slot></slot>
      </b-navbar-nav>
    </b-navbar>

    <b-sidebar id="sidebar-1" title="Menu"  bg-variant="dark" text-variant="light" shadow>
      <div class="px-3 py-2">
        <b-list-group class="w-100">
          <b-list-group-item to="/">Favoris</b-list-group-item>
          <b-list-group-item to="/mangas">All mangas</b-list-group-item>
          <b-list-group-item to="/filtres">Filtres</b-list-group-item>
          <b-list-group-item to="/updated-today">Today</b-list-group-item>
          <b-list-group-item to="/updated-weekly">This week</b-list-group-item>
        </b-list-group>
      </div>
    </b-sidebar>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class AppNavBar extends Vue {
  @Prop()
  title!: string;
  @Prop({ default: false })
  back!: boolean;
  @Prop({ default: false })
  enableSearch!: boolean;
  @Prop({ default: true })
  showSetting!: boolean;

  searchText = '';

  isHome = false;
  mounted() {
    this.isHome = this.$route.path === '/';
  }

  @Watch('searchText')
  searchChange() {
    this.$emit('search', this.searchText);
  }
}
</script>

<style>
.bar-title {
  max-width: calc( 100% - 36px - 36px);
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>