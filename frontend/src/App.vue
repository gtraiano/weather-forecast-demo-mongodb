<!--
  Copyright (c) 2019

  Main App File

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @version 1.0
 -->

<template>
    <!-- OpenWeather API key not set -->
    <OWApiKey
      v-if="!apiKeySet"
      :isOWApiKeySet="apiKeySet"
      :setOWApiKey="setOWApiKey"
    />

    <!-- backend is unavailable -->
    <BackendStatus
      v-else-if="!backendStatus"
      :isBackendOnline="backendStatus"
      :showAvailableUrls="showAvailable"
    />

    <!-- backend is available -->
    <div 
        v-else-if="apiKeySet && backendStatus"
        id="app"
        tabindex="0"
        @keydown.esc="$store.dispatch('search/clear')"
    >
        <!-- display overlay with search results -->
        <b-overlay
            :show="$store.getters['search/getShowResults'] && !$store.getters['action/getShow']"
            :z-index="(Number.MAX_VALUE/8).toLocaleString('fullwide', { useGrouping: false })"
        >
            <template #overlay>
                <div style="width: 100vw; position: relative; height: 6vh;">
                  <Alert/>
                </div>
                <SearchResults :searchCity="searchCity" />
            </template>

            <!-- app contents when overlay is off -->
            <!-- navigation header -->
            <TopHeader/>
            <!-- alert -->
            <div
              :style="{
                height: '6vh',
                maxHeight: 'max-content',
                width: '100%',
                position: 'absolute',
                top: '3.5em',
                zIndex: $store.getters['alert/getShow'] ? 10000 : 0
              }"
            >
              <Alert v-if="!$store.getters['search/getShowResults']" />
            </div>
            <!-- render active route view -->
            <router-view/>

            <!-- confirmation dialog box -->
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
import { BOverlay, BModal } from 'bootstrap-vue';
import SearchResults from './components/SearchResults';
import { pingActiveProtocol, setBackendUrl, getOWApiKey, setOWApiKey } from './controllers/backend.js';
import Alert from './components/Alert.vue';
import { OWApiKey, BackendStatus } from './components/BackendIssues';

export default {
	name: 'app',

	components: {
		TopHeader,
    BOverlay,
    BModal,
    SearchResults,
    Alert,
    OWApiKey,
    BackendStatus
	},

  data() {
      return {
          backendStatus: true,          // backend is available
          pingHandle: null,             // backend ping setInterval handle
          showAvailable: false,         // show available backend options when backend is unavailable
          upToDate: null,               // forecast data is up to date (or needs to be refetched from openweather)
          upToDateHandle: null,         // check forecast data up to date setInterval handle
          upToDateLastChecked: null,    // forecast data up to date last checked
          apiKeySet: true               // OpenWeather API key is set
      }
  },

  methods: {
      async checkBackendStatus() {
          this.backendStatus = await pingActiveProtocol() !== 404;
      },

      checkUpToDate() {
      /* checks forecast data is up to date */
          let upToDate = JSON.parse(window.localStorage.getItem('upToDate')) || 0;
          // if option to refresh outdated forecast data is disabled, return always true
          this.upToDate = !this.autoRefetch
              ? true
              : !(upToDate < (Date.now() + this.$store.getters['preferences/getPreference']('frontend.autoRefetchOlderThan')*3600000));
          this.upToDateLastChecked = Date.now();
      },

      setCheckUpToDateInterval(interval) {
      /* sets interval for checkUpToDate(), use 0 to clear interval */
          clearInterval(this.upToDateHandle);
          this.upToDateHandle = 0;
          if(interval !== 0) {
              this.upToDateHandle = setInterval(this.checkUpToDate, interval);
          }
      },

      async initializateApp() {
      /* app initialization */
          try {
              // check backend status 
              console.log('Checking backend status');
              await this.$store.dispatch('preferences/initializeAvailableProtocols');
              await this.checkBackendStatus();
              if(this.backendStatus) {
                  //console.log('OW_API_KEY', await this.getOWApiKey());
                  this.apiKeySet = await getOWApiKey() != '';
                  console.log(`OpenWeather API key is${this.apiKeySet ? '' : ' not'} set`)
                  console.log('Loading forecast data');
                  if(this.autoRefetch) {
                      // check if forecast data is needs to be refreshed
                      this.checkUpToDate();
                      await this.$store.dispatch('allCityData/setAllCityDataAsync', !this.upToDate);
                      // enable check up to date interval
                      this.setCheckUpToDateInterval(this.upToDateCheckInterval);
                  }
                  else {
                      await this.$store.dispatch('allCityData/setAllCityDataAsync', false);
                  }
              }
          }
          catch(error) {
              console.log('Backend status is', this.backendStatus ? 'online' : 'offline'); 
              console.error(error.message);
          }
      },

      setBackendUrl(url) {
          setBackendUrl(url);
      },

      async searchCity() {
          this.$store.dispatch('search/setSearchTerm', document.getElementById('search-input').value);
          await this.$store.dispatch('search/setShowResults', true);
          await this.$store.dispatch('search/searchCity');
      },

      async setOWApiKey(key) {
          try {
              this.apiKeySet = await setOWApiKey(key) != '';
              console.log('API key set to', await getOWApiKey());
            }
            catch(error) {
                console.error(error.message);
            }
      }
  },

  computed: {
      theme() {
      // active app theme
          return this.$store.getters['preferences/getPreference']('frontend.activeTheme');
      },

      autoRefetch() {
      // automatic refetch
          return this.$store.getters['preferences/getPreference']('frontend.autoRefetch');
      },

      upToDateCheckInterval() {
          return this.$store.getters['preferences/getPreference']('frontend.checkUpToDatePeriod');
      }
  },

  watch: {
      async backendStatus() {
          await this.checkBackendStatus();
          console.log('Backend status is', this.backendStatus ? 'online' : 'offline');
          if(this.backendStatus) {
              clearInterval(this.pingHandle);
              this.pingHandle = 0;
              await this.initializateApp();
          }
          else {
              this.pingHandle = setInterval(this.checkBackendStatus, 3000); // reset interval if necessary
          }
      },

      theme() {
          document.documentElement.setAttribute('theme', this.theme);
      },

      autoRefetch() {
          if(!this.autoRefetch) {
              this.setCheckUpToDateInterval(0);
          }
          else {
              this.checkUpToDate();
              this.setCheckUpToDateInterval(this.upToDateCheckInterval);
          }
          console.log(this.autoRefetch ? 'Enabled' : 'Disabled', 'automatic refetch');
      },

      async upToDateLastChecked(newValue, oldValue) {
          console.log(`Forecast data is ${!this.upToDate ? 'not' : ''} up to date on ${new Date(this.upToDateLastChecked)}`);
          if(!this.upToDate) {
              // refresh forecast data
              console.log('Forecast data is outdated, fetching fresh data');
              await this.$store.dispatch('allCityData/setAllCityDataAsync', !this.upToDate);
          }
      },

      upToDateCheckInterval() {
          console.log('Set up to date check interval to', this.upToDateCheckInterval);
          this.setCheckUpToDateInterval(this.upToDateCheckInterval);
      }
  },

  async created() {
      await this.initializateApp();
  },

  mounted() {
      document.documentElement.setAttribute('theme', this.theme);
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
  margin: 0px;
}

h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}

.tooltip .arrow {
  display: none !important;
}

#app .container-fluid {
    margin-top: 1%;
}
</style>
