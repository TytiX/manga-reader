import _Vue from 'vue';
import axios from 'axios';

import { UserProfile, Subscription } from '@/models';

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

  const storeKey = (sub: Subscription) => {
    localStorage.setItem('subscription', JSON.stringify(sub));
  }

  /***********************************************************************************************
   * Push message 1/2
   ***********************************************************************************************/
  // Boilerplate borrowed from https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const subscribePushNotification = async () => {
    const registration = await navigator.serviceWorker.register('/push-sw.js', {scope: '/'});

    const publicVapidKey = (await axios.get(`/api/web-push/publickey`)).data;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    axios.post(`/api/userprofile/${profileId}/subscribe`, subscription).then( (response) => {
      storeKey(response.data as unknown as Subscription);
    }).catch(e => console.error(e));
  }

  const unsubscribePushNotification = async () => {
    const registration = await navigator.serviceWorker.getRegistration('push-sw.js');
    console.log(registration);
    if (registration) registration.unregister();
    
    const sub = localStorage.getItem('subscription') || '{}';
    axios.post(`/api/userprofile/${profileId}/unsubscribe`, JSON.parse( sub )).then( () => {
      localStorage.removeItem('subscription');
    });
  }

  /***********************************************************************************************
   * Profile
   ***********************************************************************************************/
  Vue.prototype.$setProfile = function (profile: UserProfile) {
    localStorage.setItem('profileId', profile.id);
    profileId = profile.id;
    if (localStorage.getItem('subscription')) {
      unsubscribePushNotification().catch(e => console.error(e));
    }
    subscribePushNotification().catch()
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

  /***********************************************************************************************
   * Push message 2/2
   ***********************************************************************************************/
  
  if (window.Notification) {
    Notification.requestPermission(function (status) {
      // Si l'utilisateur est OK
      console.log(status);
      if ( status === "granted" &&
        'serviceWorker' in navigator &&
        profileId &&
        !localStorage.getItem('subscription') ) {
        subscribePushNotification().catch(e => console.error(e));
      }
    });
  } else {
    console.error('ho no...')
  }

}
