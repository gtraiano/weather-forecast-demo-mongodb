<!--
  Copyright (c) 2019

  Main App File

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @version 1.0
 -->

<template>
    <div 
        id="app"
        tabindex="0"
        @keydown.esc="$store.dispatch('search/clear')"
    >
        <!-- display overlay with search results -->
        <b-overlay
            style="height: 99vh"
            :show="$store.getters['search/getShowResults'] && !$store.getters['action/getShow']"
            :z-index="(Number.MAX_VALUE/8).toLocaleString('fullwide', { useGrouping: false })"
        >
            <template #overlay>
                <h3> {{ $t('search for')}} <i>"{{ $store.getters['search/getSearchTerm'] }}"</i></h3>
                <div v-if="$store.getters['search/getSearchResults'].length">
                    <SearchResults :results="$store.getters['search/getSearchResults']" />
                </div>
                <div v-else>
                    <h4>{{ $t('no results') }}</h4>
                </div>
                <br>
                <b-button @click="$store.dispatch('search/clear')">
                    {{ $t('close') }}
                </b-button>
            </template>
            <TopHeader/>
            <router-view/>
            <!-- intended to render modal inside the overlay but had trouble with its z-index being lower than the overlay's -->
            <b-modal
                no-fade
                hide-backdrop
                centered
                :title="$store.getters['action/getTitle']"
                :visible="$store.getters['action/getShow']"
                :okTitle="$t('yes')"
                :cancelTitle="$t('no')"
                @ok="$store.dispatch('action/setAnswer', true)"
                @cancel="$store.dispatch('action/setAnswer', false)"
                @close="$store.dispatch('action/setAnswer', false)"
                @hidden="$store.dispatch('action/setAnswer', false)"
            >
                <p>
                    {{ $store.getters['action/getMessage'] }}
                </p>
            </b-modal>
        </b-overlay>
    </div>
</template>

<script>
import TopHeader from './components/TopHeader.vue';
import { BOverlay, BButton, BModal } from 'bootstrap-vue'
import SearchResults from './components/SearchResults.vue';

export default {
	name: 'app',

	components: {
		TopHeader,
    BOverlay,
    BButton,
    BModal,
    SearchResults
	},

	data () {
		return {
			msg: 'Welcome to Weather Forecast App',
			counter: 1,
			max: 10,
		}
	}
}
</script>

<style>
/* host fonts locally (used https://google-webfonts-helper.herokuapp.com/fonts) */
/* roboto-regular - greek_latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto'), local('Roboto-Regular'),
       url('./assets/fonts/roboto-v20-greek_latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-v20-greek_latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-700 - greek_latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  src: local('Roboto Bold'), local('Roboto-Bold'),
       url('./assets/fonts/roboto-v20-greek_latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-v20-greek_latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-mono-regular - greek_latin */
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto Mono'), local('RobotoMono-Regular'),
       url('./assets/fonts/roboto-mono-v7-greek_latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-mono-v7-greek_latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-mono-700 - greek_latin */
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 700;
  src: local('Roboto Mono Bold'), local('RobotoMono-Bold'),
       url('./assets/fonts/roboto-mono-v7-greek_latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-mono-v7-greek_latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

#app {
  /*font-family: Helvetica, Arial, sans-serif;*/
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 6px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.topinfo {
    background-color: gray;
    margin-top: 3%;
}
</style>
