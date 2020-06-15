<template>
  <b-navbar type="dark" variant="dark">
    <b-navbar-nav>
      <b-nav-item v-if="!isHome" to="/"><b-icon icon="house"></b-icon></b-nav-item>
    </b-navbar-nav>
    <b-navbar-brand>{{title}}</b-navbar-brand>
    <b-navbar-nav class="ml-auto">
      <b-nav-form>
        <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
      </b-nav-form>
      <b-nav-item to="/settings"><b-icon icon="gear"></b-icon></b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class AppNavBar extends Vue {
  @Prop()
  title!: string;
  isHome = false;
  mounted() {
    this.isHome = this.$route.path === '/';
  }
}
</script>

<style>

</style>