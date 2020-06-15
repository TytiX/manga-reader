<template>
  <div class="container">
    <b-form @submit="onSubmit" @reset="onReset">
      <b-form-group
        label="Site name">
        <b-form-input v-model="config.name" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="Icon url">
        <b-form-input v-model="config.iconUrl" trim></b-form-input>
      </b-form-group>

      <b-form-group
        label="Manga list url">
        <b-form-input v-model="config.mangasListUrl" trim></b-form-input>
      </b-form-group>
      
      <b-form-group
        label="Manga Enclosing Xpath">
        <b-form-input v-model="config.mangaEnclosingXpath" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="mManga Link Relative Xpath">
        <b-form-input v-model="config.mangaLinkRelativeXpath" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="Manga Name Relative Xpath">
        <b-form-input v-model="config.mangaNameRelativeXpath" trim></b-form-input>
      </b-form-group>

      <b-form-group
        label="Manga Description Xpath">
        <b-form-input v-model="config.mangaDescriptionXpath" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="Manga Cover Xpath">
        <b-form-input v-model="config.mangaCoverXpath" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="Chapter Enclosing Xpath">
        <b-form-input v-model="config.chapterEnclosingXpath" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="Chapter Link Relative Xpath">
        <b-form-input v-model="config.chapterLinkRelativeXpath" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="Chapter Number Text Relative Xpath">
        <b-form-input v-model="config.chapterNumberTextRelativeXpath" trim></b-form-input>
      </b-form-group>
      <b-form-group
        label="Chapter Name Relative Xpath">
        <b-form-input v-model="config.chapterNameRelativeXpath" trim></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>

    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import axios from 'axios';

import { ScannerConfig } from '@/models';

@Component
export default class ConfigurationDetail extends Vue {
  @Prop()
  config!: ScannerConfig;

  onSubmit() {
    axios.post('/api/configuration', this.config).then( () => {
      this.$router.go(-1);
    });
  }
  onReset() {
    this.config = {};
  }
}
</script>

<style>
form {
  text-align: left;
}
</style>
