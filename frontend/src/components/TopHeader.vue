<!--
  Copyright (c) 2019

  Top Header component

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
<div>
	<b-navbar toggleable="lg" type="dark" variant="dark">
		<!--b-navbar-brand>
			<img src="../assets/logo_rect.png" class="logo">
		</b-navbar-brand-->
		<b-navbar-toggle target="nav-collapse"/>
			<b-collapse id="nav-collapse" is-nav>
				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto" style="z-index: 9999;"><!-- draw dropdown menu on top of all other elements -->
					<b-nav-item><router-link class="regular" to="/" exact>{{$t('meteomap')}}</router-link></b-nav-item>
					<b-nav-item><router-link class="regular" to="/forecasts" exact>{{$t('forecasts')}}</router-link></b-nav-item>
					<b-nav-item><router-link class="regular" to="/about" exact>{{$t('about')}}</router-link></b-nav-item>
					<LanguageSwitcher />
					<div>
					 	<b-input-group>
					    	<!--template #prepend>
					      		<b-input-group-text >{{$t('city')}}</b-input-group-text>
					    	</template-->
					    	<b-form-input
					    		class="search"
					    		:value="$store.getters['search/getSearchTerm']"
					    		:placeholder="$t('add city')"
					    		trim
					    		@input="$store.dispatch('search/setSearchTerm', $event);"
					    		@keydown.enter="searchCity()"
					    	/>
					    	<template #append>
					      		<b-button
					      			:title="$t('search forecast data')"
					      			@click="searchCity()"
					      		>
					      			<b-icon-search/>
					      		</b-button>
					    	</template>
					  	</b-input-group>
					</div>
					<b-button
						type="dark"
						variant="dark"
						@click="refreshForecastData()"
					>
			        	<b-icon-arrow-clockwise
			        		v-if="refreshing"
			          		:title="$t('refresh forecast data')"
			          		icon="arrow-clockwise"
			          		animation="spin"
			          	/>
			          	<b-icon-arrow-clockwise
			        		v-else
			          		:title="$t('refresh forecast data')"
			          		icon="arrow-clockwise"
			          	/>
			        </b-button>
				</b-navbar-nav>
			</b-collapse>
	</b-navbar>
</div>
</template>

<script type = "text/javascript" >
import Vue from 'vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { 
	BIconArrowClockwise,
	BIconSearch
} from 'bootstrap-vue';

export default {
	components: {
		LanguageSwitcher,
		BIconArrowClockwise,
		BIconSearch
	},

	data() {
		return {
			refreshing: false
		}
	},

	methods: {
		async refreshForecastData() {
			this.refreshing = true;
			await this.$store.dispatch('allCityData/setAllCityDataAsync', true);
			this.refreshing = false;
		},

		async searchCity() {
			this.$store.dispatch('search/setShowResults', true);
			await this.$store.dispatch('search/searchCity');
		}
	}
}
</script>

<style scoped>
.logo {
    height: 50px;
}

.regular {
	color: #42b983;
}

.regular:hover {
	color: yellow;
	text-decoration: none;
}

.router-link-active, .router-link-active:hover {
    /*text-decoration: underline;*/
	text-decoration: none;
    font-weight: bold;
	color: white;
}

*:focus {
	outline: none;
}

.search {
	font-size: 80%;
}

.form-control {
	height: unset;
}
</style>
