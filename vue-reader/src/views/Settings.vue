<template>
  <div>
    <AppNavBar title="Settings" :showSetting="false"></AppNavBar>
    <div class="card container mt-3">
      <h3>Configurations</h3>
      <b-button to="/settings/new">Create config</b-button>
      <ConfigurationList :configs="configs" @deleteClicked="deleteConfig"></ConfigurationList>
    </div>
    <div >
      <div class="card container mt-3">
        <h3>User Profiles</h3>
        <b-button @click="createProfile">Create profile</b-button>
        <UserProfileList
          :profiles="userprofiles"
          @saveClicked="updateProfile"
          @deleteClicked="deleteProfile"
          @test-push="testPush"
          @delete-push="deletePush">
        </UserProfileList>
      </div>
      <div class="card container mt-3">
        <h3>Tags</h3>
        <b-button to="/manage-tags">Manage tags</b-button>
      </div>
      <div class="card container mt-3">
        <h3>Mangas</h3>
        <b-button to="/manage-mangas">Manage mangas</b-button>
      </div>
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
    axios.post('/api/userprofile', profile).then( () => {
      this.refreshUserProfile();
    });
  }
  deleteProfile(profileId: string) {
    axios.delete('/api/userprofile/' + profileId).then( () => {
      this.refreshUserProfile();
    });
  }

  deleteConfig(configId: string) {
    axios.delete('/api/configuration/' + configId).then( () => {
      this.refreshConfig();
    });
  }

  // eslint-disable-next-line
  testPush(sub: any) {
    axios.get(`/api/web-push/test/${sub.id}`).then( () => {
      //
    })
  }
  // eslint-disable-next-line
  deletePush(sub: any) {
    axios.delete(`/api/web-push/${sub.id}`).then( () => {
      //
    })
  }
}
</script>

<style>

</style>