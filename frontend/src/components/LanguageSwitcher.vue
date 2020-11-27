<!--
  Copyright (c) 2019

  Language switcher component, provides a UI interface to interact with vue-i18n for switching language

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
    <!--b-nav-item-dropdown :text="getActiveLanguage()" right-->
    <b-nav-item-dropdown :text="$t('language')" right>
        <b-dropdown-item v-for="item in locales" :key="item.locale"
            v-on:click="switchLocale(item.locale)"
            class="container-fluid p-0 m-0"
        >
            <!-- make active language bold -->
            <div v-if="getActiveLocale() === item.locale">
                <strong>{{item.language}}</strong>
            </div>
            <div v-else>
                {{item.language}}
            </div>
        </b-dropdown-item>
    </b-nav-item-dropdown>
</template>

<script type = "text/javascript" >
import Vue from 'vue';
import supportedLocales from '../lang/supportedLocales.js';

export default {
    name: 'language-switcher',

    data: function() {
        return {
            locales: supportedLocales() /* supported locales */
        }
    },

    methods: {
        switchLocale: function(locale) {
        /* switches locale */
            this.$i18n.locale = locale;
            window.localStorage.setItem('locale', locale); // update key
            this.$store.dispatch('locale/setLocale', this.$i18n.locale); // update store state
        },

        /*getActiveLanguage: function() {
        // return language name of the active locale
            return this.locales.find(l => {return l.locale === this.$i18n.locale}).language;
        },*/

        getActiveLocale: function() {
        /* return active locale */
            return this.$i18n.locale;
        }
    },

    created () {
        if (window.localStorage.getItem('locale')){ // if key is set, otherwise defaults to en
            this.$i18n.locale = window.localStorage.getItem('locale');
        }
    }
}
</script>
