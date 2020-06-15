<template>
  <b-list-group class="w-100">
    <b-list-group-item
      v-for="profile of profiles"
      :key="profile.id"
      @click="selectProfile(profile)">
      <b-icon v-if="$currentProfile === profile.id" icon="check"></b-icon>
      <b-input v-model="profile.name"></b-input>
      <div>
        <b-button variant="warn" @click.prevent="saveUserProfile(profile)"><b-icon icon="cloud-upload"></b-icon></b-button>
        <b-button variant="danger" @click.prevent="deleteUserProfile(profile.id)"><b-icon icon="trash"></b-icon></b-button>
      </div>
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { UserProfile } from '@/models';

@Component
export default class ConfigurationList extends Vue {
  @Prop()
  profiles!: UserProfile[];

  selectProfile(profile: UserProfile) {
    this.$setProfile(profile);
  }
  saveUserProfile(profile: UserProfile) {
    this.$emit('saveClicked', profile);
  }
  deleteUserProfile(id: string) {
    this.$emit('deleteClicked', id);
  }
}
</script>

<style>

</style>
