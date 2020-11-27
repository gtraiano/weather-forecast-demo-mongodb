<!--
  Copyright (c) 2020

  About component

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->


<template>
<b-container fluid>
	<div>
		<h1>{{ $t('about') }}</h1>
		<p> 
			<div style="text-align: left" v-html="$t('about info')"></div>
		</p>
	</div>
	<div>
		<h1>{{$t('functions')}}</h1>
		<div class="text-left">
			<h2>{{$t('search-add.header')}}</h2>
			<li>
				<ul>
					{{$t('search-add.step1')}}
				</ul>
				<ul>
					<div style="display: inline-block;">
						<b-input-group>
						    	<b-form-input
						    		class="search"
						    		:placeholder="$t('add city')"
						    	/>
						    	<template #append>
						      		<b-button
						      			:title="$t('search forecast data')"
						      		>
						      			<b-icon-search/>
						      		</b-button>
						    	</template>
						  	</b-input-group>
					</div>
				</ul>

				<ul>
					{{$t('search-add.step2')}}
				</ul>
				<ul>
					<SearchResults
						:results="[
							{ lat: 0, lon: 0, name: $t('city name'), region: $t('region'), postCode: $t('postal code'), country: $t('country') },
							{ lat: 1, lon: 1, name: 'Another City', region: 'Nowhere', postCode: '123456', country: 'Noland' }
						]" 
						:onClick="() => {}"
					/>
				</ul>
				<ul id="promptlist">
					{{$t('search-add.step3')}}
				</ul>
				<ul>
					{{$t('search-add.step4')}}
				</ul>
				<ul>
					<SearchResults
						:results="[
							{ lat: 0, lon: 0, name: $t('city name'), region: $t('region'), postCode: $t('postal code'), country: $t('country') },
							{ lat: 1, lon: 1, name: 'Another City', region: 'Nowhere', postCode: '123456', country: 'Noland' }
						]" 
						:onClick="() => {}"
						:alreadyAdded="[{ lat: 0, lon: 0 }]"
						:exists="[{ lat: 1, lon: 1 }]"
					/>
				</ul>
			</li>
		</div>
		
		<div class="text-left mt-3">
			<h2>{{ $t('forecasts') }}</h2>
			<!--h5>{{ $t('forecasts.header2', [$t('actions'), $t('overview')]) }}</h5-->
			<li>
				<ul>
					{{$t('click on')}}
					<Controls
						class="ml-1 mr-1"
						:variables="['temperature', 'humidity', 'pressure']"
						@selected_var="variable => { selectedVar = variable }"
					/>
					{{$t('forecasts.step0')}}
				</ul>
				<ul>
					<b-table
						striped hover borderless sticky-header small head-variant="light"
						:fields="[
							{ key: 'actions', label: $t('actions'), sortable: false },
							{ key: 'city', label: $t('city'), sortable: true },
							{ key: 'forecasts', label: $t('forecasts'), sortable: false }
						]"
						:items="[
							{ 'city': 'City Name', 'forecasts': selectedVar ? $t(selectedVar) : '' }
						]"
					>
						<template v-slot:cell(city)="data">
							<a href="" @click.prevent>
								{{data.item.city}}
							</a>
							
						</template>
						<template v-slot:cell(actions)="data">
					        <a
					            class="ml-1 mr-1"
					            href=""
					            style="color: unset"
					            @click.prevent
					        >
					          <b-icon-graph-up :title="$t('plot')" />
					        </a>
					      	<a
					            class="ml-1 mr-1"
					      		href=""
					      		style="color: unset"
					      		@click.prevent
					      	>
					      		  <b-icon-arrow-clockwise :title="$t('refresh forecast data')" />
					      	</a>
					      	<a
					            class="ml-1 mr-1"
					      		href=""
					      		style="color: unset"
					      		@click.prevent
					      	>
					      		  <b-icon-trash :title="$t('delete')" />
					      	</a>
					    </template>
					</b-table>
				</ul>
				<ul>
					<h5>{{ $t('forecasts.header2', [$t('actions'), $t('overview')]) }}</h5>
				</ul>
				<ul>
					{{$t('click on')}} <b-icon-graph-up class="ml-1 mr-1"/> {{$t('forecasts.step2')}}
				</ul>
				<ul>
					{{$t('click on')}} <b-icon-trash class="ml-1 mr-1"/> {{$t('forecasts.step3')}}
				</ul>
				<ul>
					{{$t('click on')}} <b-icon-arrow-clockwise class="ml-1 mr-1"/> {{$t('forecasts.step4')}}
				</ul>
				<ul>
					<h5>{{ $t('forecasts.header2', [$t('city'), $t('overview')]) }}</h5>
				</ul>
				<ul>
					{{ $t('forecasts.step1') }}
				</ul>
			</li>
		</div>

		<div class="text-left mt-3">
			<h2>{{ $t('meteomap') }}</h2>
			<li>
				<ul>
					{{$t('map.step1')}}
				</ul>
				<ul>
					{{$t('map.step2')}}
				</ul>
			</li>
		</div>
	</div>
</b-container>
</template>

<script>
import { BIconSearch, BIconTrash, BIconArrowClockwise, BIconGraphUp } from 'bootstrap-vue'
import SearchResults from './SearchResults.vue'
import Controls from './Controls.vue'
import Vue from 'vue'

export default {
	name: 'About',
	components: {
		BIconSearch,
		SearchResults,
		BIconTrash,
		BIconArrowClockwise,
    	BIconGraphUp,
    	Controls
	},
	data() {
		return {
			selectedVar: null
		}
	}
}
</script>
