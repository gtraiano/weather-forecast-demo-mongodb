<template>
<div
    style="
        min-width: 20vw;
        max-width: 30vw;
        margin-left: auto;
        margin-right: auto;
    "
>
    <h3> {{ $t('search for')}} <i>"{{ $store.getters['search/getSearchTerm'] }}"</i></h3>

    <div
        style="
            margin-bottom: 1vh;
            height: inherit;
        "
    >
        <b-input-group>
            <b-form-input
                id="search-input"
                class="search"
                :value="$store.getters['search/getSearchTerm']"
                :placeholder="$t('add city')"
                trim
                @keydown.enter="searchCity()"
                style="
                    background-color: #fff;
                    height: inherit;
                "
            />
            <template #append>
                <b-button
                  @click="searchCity()"
                >
                  <b-icon-search/>
                </b-button>
            </template>
          </b-input-group>
    </div>

    <div v-if="$store.getters['search/getShowResults']">
        <SearchResultsList :results="$store.getters['search/getSearchResults']" />
    </div>
    <br>
    <b-button @click="$store.dispatch('search/clear')">
        {{ $t('close') }}
    </b-button>
</div>
</template>

<script>
import SearchResultsList from './SearchResultsList.vue';
import { BIconSearch } from 'bootstrap-vue';
export default {
	name: 'SearchResults',

	components: {
		SearchResultsList,
		BIconSearch
	},

	props: {
		searchCity: {
			type: Function,
			required: true
		}
	}
}
</script>