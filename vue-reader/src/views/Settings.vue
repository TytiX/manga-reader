<template>
  <div>
    <AppNavBar title="Settings"></AppNavBar>
    <div class="card container mt-3">
      <h3>Configurations</h3>
      <b-button to="/settings/new">Create config</b-button>
      <ConfigurationList :configs="configs" @deleteClicked="deleteConfig"></ConfigurationList>
    </div>
    <div class="card container mt-3">
      <h3>User Profiles</h3>
      <b-button @click="createProfile">Create profile</b-button>
      <UserProfileList :profiles="userprofiles" @saveClicked="updateProfile" @deleteClicked="deleteProfile"></UserProfileList>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import ConfigurationList from '@/components/settings/ConfigurationList.vue';
import UserProfileList from '@/components/settings/UserProfileList.vue';
import { ScannerConfig, UserProfile } from '@/models';

@Component({
  components: {
    AppNavBar,
    ConfigurationList,
    UserProfileList
  }
})
export default class Settings extends Vue {
  configs: ScannerConfig[] = [];
  userprofiles: UserProfile[] = [];
  mounted() {
    this.refreshConfig();
    this.refreshUserProfile();
  }

  refreshConfig() {
    axios.get('/api/configuration').then( response => {
      this.configs = response.data;
    });
  }
  refreshUserProfile() {
    axios.get('/api/userprofile').then( response => {
      this.userprofiles = response.data;
    });
  }

  createProfile() {
    axios.post('/api/userprofile', {}).then( () => {
      this.refreshUserProfile();
    });
  }

  updateProfile(profile: UserProfile) {
    axios.post('/api/userprofile', profile).then( response => {
      this.refreshUserProfile();
    });
  }
  deleteProfile(profileId: string) {
    axios.delete('/api/userprofile/' + profileId).then( response => {
      this.refreshUserProfile();
    });
  }

  deleteConfig(configId: string) {
    axios.delete('/api/configuration/' + configId).then( response => {
      this.refreshConfig();
    });
  }
}
</script>

<style>

</style>