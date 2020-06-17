import _Vue from 'vue';
import axios from 'axios';

import { UserProfile } from '@/models';

declare module 'vue/types/vue' {
  interface Vue {
    $currentProfile: UserProfile;
    $setProfile: (profile: UserProfile) => void;
    $addToFavorite: (mangaId: string) => Promise<void>;
    $removeFromFavorite: (mangaId: string) => Promise<void>;
    $sendAdvancement: (sourceId: string, chapterId: string, page: number) => Promise<void>;
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
    return axios.post('/api/userprofile/' + profileId + '/addfav/' + mangaId);
  }
  Vue.prototype.$removeFromFavorite = (mangaId: string) => {
    return axios.post('/api/userprofile/' + profileId + '/rmfav/' + mangaId);
  }
  Vue.prototype.$sendAdvancement = (sourceId: string, chapterId: string, pageNumber: number) => {
    return axios.post('/api/userprofile/' + profileId + '/advancement', {
      sourceId,
      chapterId,
      pageNumber
    });
  }
}
