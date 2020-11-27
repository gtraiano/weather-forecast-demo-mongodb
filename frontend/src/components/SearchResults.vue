<template>
	<b-list-group :style="{ maxHeight: '500px', overflow: 'auto'}">
		<b-list-group-item
			v-if="results.length"
			v-for="(result, index) in results"
			:key="index"
			active
			class="flex-column align-items-start"
		>
		    <div class="d-flex w-100 justify-content-between">
			    <h5 class="mb-1">{{ result.name }}</h5>
			    <span v-if="isAdded(result)"> <b-icon-check scale="2"/> </span>
			    <span v-else-if="alreadyExists(result)" :style="{fontSize: '80%'}">{{ $t('already added') }}</span>
		      	<b-button
		      		v-else
		      		size="sm"
		      		@click="typeof onClick === 'undefined' ? $store.dispatch('action/add', result) : onClick"
		      	>
		      		{{ $t('add') }}
		      	</b-button>
		      	
		      	
		    </div>
		    <p class="mb-1 d-flex w-100">
		    	{{ result.region }}, {{ result.postCode }}, {{ result.country }}
		    </p>
		</b-list-group-item>
		<p v-else>
			{{ $t('no results') }}
		</p>
	</b-list-group>
</template>

<script type="text/javascript">
import { BListGroup, BIconCheck } from 'bootstrap-vue'
import { mapGetters } from 'vuex'

export default {
	name: 'SearchResults',
	components: {
		BListGroup,
		BIconCheck
	},
	props: {
		results: {
			type: [Array, null],
			required: true,
			default: []
		},

		onClick: {
			type: Function,
			required: false
		},

		alreadyAdded: {
		/* list of added results
		for demo purposes only */
			type: Array,
			required: false,
			default: function() {
				return [];
			}
		},

		exists: {
		/* list of results that already exist
		for demo purposes only */
			type: Array,
			required: false,
			default: function() {
				return [];
			}	
		}
	},
	methods: {
		/*isAdded(result) {
			return this.addedCities.findIndex(city => {
				return city.lat == Number.parseFloat(result.lat) && city.lon == Number.parseFloat(result.lon);
			}) != -1;
		},
		alreadyExists(result) {
			return this.citiesCoords.has(`${Number.parseFloat(result.lat)},${Number.parseFloat(result.lon)}`);
		}*/
		isAdded(result) {
			if(this.alreadyAdded.length) {
				return this.alreadyAdded.findIndex(city => {
					return city.lat == Number.parseFloat(result.lat) && city.lon == Number.parseFloat(result.lon);	
				}) !== -1
			}
			else {
				return this.addedCities.findIndex(city => {
					return city.lat == Number.parseFloat(result.lat) && city.lon == Number.parseFloat(result.lon);
				}) !== -1;
			}
		},
		alreadyExists(result) {
			if(this.exists.length) {
				return this.exists.findIndex(city => {
					return city.lat === Number.parseFloat(result.lat) && city.lon === Number.parseFloat(result.lon)
				}) !== -1;
			}
			else {
				return this.citiesCoords.has(`${Number.parseFloat(result.lat)},${Number.parseFloat(result.lon)}`);
			}
		}
	},
	computed: {
		...mapGetters({ addedCities: 'search/getAddedCities' }),
		...mapGetters({ citiesCoords: 'allCityData/getCitiesCoords' })
	}
}
</script>

<style type="text/css" scoped>
</style>