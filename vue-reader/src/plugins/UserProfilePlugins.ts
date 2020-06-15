import _Vue from 'vue';
import axios from 'axios';

import { UserProfile } from '@/models';

declare module 'vue/types/vue' {
  interface Vue {
    $currentProfile: UserProfile;
    $setProfile: (profile: UserProfile) => void;
    $addToFavorite: (mangaId: string) => void;
    $removeFromFavorite: (mangaId: string) => void;
  }
}

export default function UserProfilePlugin(Vue: typeof _Vue): void {
  
  let profileId = localStorage.getItem('profileId');

  Vue.prototype.$setProfile = function (profile: UserProfile) {
    localStorage.setItem('profileId', profile.id);
    profileId = profile.id;
  }

  Vue.prototype.$currentProfile = profileId;

  Vue.prototype.$addToFavorite = (mangaId: string) => {
    axios.post('/api/userprofile/' + profileId + '/addfav/' + mangaId).then( () => {
      //
    });
  }
  Vue.prototype.$removeFromFavorite = (mangaId: string) => {
    axios.post('/api/userprofile/' + profileId + '/rmfav/' + mangaId).then( () => {
      //
    });
  }
}
