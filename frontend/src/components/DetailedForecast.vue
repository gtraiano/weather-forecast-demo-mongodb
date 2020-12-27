<!--
  Copyright (c) 2019

  Displays detailed hourly forecast from OpenWeather data

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->
<template>
<div v-if="!loading">
	<!-- paginated version -->
	<div v-if="paginated">
		<b-card-group
			deck
			id="deck-cards"
		>
			<b-card
				v-for="item in forecastData.hourly.slice(Math.trunc(cardsPerPage)*(currentPage - 1), currentPage*Math.trunc(cardsPerPage))"
				:key="item.dt"
				class="text-center"
				:style="{
					'max-width': `${100/Math.trunc(cardsPerPage)}%`,
					'min-width': 'auto'
				}"
				:title="day(item.dt*1000)"
			>
				<b-card-sub-title>
					{{ date(item.dt*1000)}}
				</b-card-sub-title>
				<b-card-img
					:src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png`"
					img-alt="Card image"
					img-top
					style="object-fit: contain; min-height: calc(0.8*200px); max-height: calc(0.8*200px)"
				>
				</b-card-img>
				<b-card-text>{{$t(item.weather[0].description)}}</b-card-text>
				<b-card-text>
					<b-container fluid class="m-0 p-0">
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="6" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('temperature')}}</b-col>
							<b-col cols="4" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.temp}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('humidity')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.humidity}}%</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('pressure')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.pressure}}&nbsp;hPa</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('feels like')}}</b-col>
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.feels_like}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('cloudiness')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.clouds}}%</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('dew point')}}</b-col>
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.dew_point}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('visibility')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.visibility}} m</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">
								{{$t('wind')}}
							</b-col>
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">
								{{`${windDirection(item.wind_deg)} ${item.wind_speed} km/h`}}
							</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
					</b-container>
				</b-card-text>
			</b-card>
		</b-card-group>
		<div style="margin-top: 15px">
			<b-pagination
				v-model="currentPage"
				:total-rows="forecastData.hourly.length"
				:per-page="Math.trunc(cardsPerPage)"
				size="sm"
				align="center"
				first-class="m-0"
				next-class="m-0"
				last-class="m-0"
				page-class="m-0"
				prev-class="m-0"
				ellipsis-class="m-0"
			/>
		</div>
	</div>

	<!-- scrollbar version -->
	<div v-else>
		<b-card-group
			deck
			:style="{
				'overflow-x': 'auto',
				'scrollbar-width': 'thin',
				'flex-wrap': 'nowrap'
			}"
		>
			<b-card
				v-for="(item, index) in forecastData.hourly"
				:key="item.dt"
				class="text-center"
				:style="{
					'max-width': `${100/Math.trunc(cardsPerPage)}%`,
					'min-width': `${100/Math.trunc(cardsPerPage)}%`,
					'margin-bottom': '1vh',
					'margin-left': index == 0 ? '0px' : '', // 1st card
					'margin-right': index == forecastData.hourly.length - 1 ? '0px' : '' // last card
				}"
				:title="day(item.dt*1000)"
			>
				<b-card-sub-title>
					{{ date(item.dt*1000)}}
				</b-card-sub-title>
				<b-card-img
					:src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png`"
					img-alt="Card image"
					img-top
					style="object-fit: contain; min-height: calc(0.8*200px); max-height: calc(0.8*200px)"
				>
				</b-card-img>
				<b-card-text>{{$t(item.weather[0].description)}}</b-card-text>
				<b-card-text>
					<b-container fluid class="m-0 p-0">
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="6" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('temperature')}}</b-col>
							<b-col cols="4" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.temp}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('humidity')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.humidity}}%</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('pressure')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.pressure}}&nbsp;hPa</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('feels like')}}</b-col>
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.feels_like}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('cloudiness')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.clouds}}%</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('dew point')}}</b-col>
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.dew_point}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('visibility')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.visibility}} m</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">
								{{$t('wind')}}
							</b-col>
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">
								{{`${windDirection(item.wind_deg)} ${item.wind_speed} km/h`}}
							</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
					</b-container>
				</b-card-text>
			</b-card>
		</b-card-group>
	</div>
</div>

<!-- loading animation -->
<div v-else style="margin-top: 25vh">
	<b-icon-three-dots scale="10" animation="throb" />
</div>
</template>

<script>
import { getCityLatLon } from '../controllers/backend'
import { BIconThreeDots } from 'bootstrap-vue'

export default {
	name: 'DetailedForecast',
	
	props: {
		// latitude & longitude of city
		lat: {
			type: Number,
			required: true
		},
		
		lon: {
			type: Number,
			required: true
		},
		
		paginated: Boolean, // whether to use pagination or scrollbar
		
		perPage: { // cards per page
			type: Number,
			required: true,
			validator: prop => typeof prop === 'number' && Number.isInteger(prop) && prop > 0
		},
	},

	components: { BIconThreeDots },

	data() {
		return {
			currentPage: 1,
			loading: true,
			forecastData: [],
			deckWidth: 0, // used to watch card deck width
			cardsPerPage: 0 // cards per page adjusted to card deck width
		}
	},

	methods: {
		extractName(entry, locale = this.$i18n.locale) {
			return (
				entry.location[locale].city || entry.location[locale].town || entry.location[locale].village
				|| entry.location[locale].address.city || entry.location[locale].address.town || entry.location[locale].address.village || entry.location[locale].address.county || entry.location[locale].address.region
			)
		},

		date(datetime) {
			return new Date(datetime).toLocaleDateString(this.$i18n.locale, { day:'2-digit', month: 'long', hour: '2-digit' });
		},

		day(datetime) {
			return new Date(datetime).toLocaleDateString(this.$i18n.locale, { weekday: 'long'});
		},

		windDirection(degrees) {
			const windDir = {
				en: ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"],
				el: ["Β","ΒΒΑ","ΒΑ","ΑΒΑ","Α","ΑΝΑ","ΝΑ","ΝΝΑ","Ν","ΝΝΔ","ΝΔ","ΔΝΔ","Δ","ΔΒΔ","ΒΔ","ΒΒΔ","Β"]
			};
			return windDir[this.$i18n.locale][Math.round((degrees % 360) / 22.5)];
 		},

 		resized() {
 			const el = document.getElementById('deck-cards');
 			//this.cardWidth = el.children[0].children[0].clientWidth;
 			this.deckWidth = el.clientWidth
 		}
	},

	computed: {
		coords() {
			return { lat: this.lat, lon: this.lon };
		}
	},

	created() {
		if(this.paginated)
			window.addEventListener('resize', this.resized)
	},

	destroyed() {
		if(this.paginated)
			window.removeEventListener('resize', this.resized)
	},

	async mounted() {
		this.loading = true;
		this.forecastData = await getCityLatLon(this.lat, this.lon);
		this.loading = false;
		this.cardsPerPage = this.perPage;

		if(this.paginated) {
			await this.$nextTick();
			this.resized()
		}
	},

	watch: {
		async coords(newValue, oldValue) {
			this.loading = true;
			this.currentPage = 1;
			this.forecastData = await getCityLatLon(newValue.lat, newValue.lon);
			this.loading = false;	
		},

		deckWidth(newValue, oldValue) {
		// change number of cards per page when card deck is resized
			if(this.paginated && newValue !== 0 && oldValue !== 0) {
				let dw = (newValue - oldValue) / oldValue;
				let adjusted = Math.round( (this.cardsPerPage*(1 + dw) + Number.EPSILON) * 100 ) / 100;
				this.cardsPerPage = adjusted < this.perPage
					? adjusted < 1 ? Math.round(2 - adjusted) : adjusted
					: this.perPage;

				//console.log(dw > 0 ? 'expanded' : 'shrinked', 'adjusted', adjusted, 'cardsPerPage', this.cardsPerPage, Math.trunc(this.cardsPerPage));
			}
		}
	}
}
</script>