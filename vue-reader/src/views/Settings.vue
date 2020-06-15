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
      <b-button to="/profile/new">Create profile</b-button>
      <!-- <UserProfileList :profiles="userprofiles"></UserProfileList> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import ConfigurationList from '@/components/settings/ConfigurationList.vue';
import { ScannerConfig, UserProfile } from '@/models';

@Component({
  components: {
    AppNavBar,
    ConfigurationList
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

  deleteConfig(configId: string) {
    axios.delete('/api/configuration/' + configId).then( response => {
      this.refreshConfig();
    });
  }
}
</script>

<style>

</style>