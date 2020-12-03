<!--
  Copyright (c) 2019

  Displays detailed hourly forecast from OpenWeather data

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->
<template>
<div v-if="!loading">
	<b-card-group deck v-if="!loading">
		<b-card
			v-for="item in forecastData.hourly.slice(perPage*(currentPage - 1), currentPage*perPage)"
			:key="item.dt"
			class="text-center"
			
			:style="{
				'max-width': `${(100/perPage)-2}%`,
				'min-width': `${(100/perPage)-2}%`,
				'max-height': `${(100/perPage)-2}%`,
				'min-height': `${(100/perPage)-2}%`
			}"
			:title="day(item.dt*1000)"
		>
			<b-card-sub-title>
				{{ date(item.dt*1000)}}
			</b-card-sub-title>
			<b-card-img
				:src="`http://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png`"
				img-alt="Card image"
				img-top
				style="scale: 0.75"
			>
			</b-card-img>
			<b-card-text>
				<b-container fluid class="m-0 p-0">
					<b-row>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						<b-col cols="6" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold">{{$t('temperature')}}</b-col>
						<b-col cols="4" class="ml-0 mr-0 pl-0 pr-0 text-right">{{`${item.temp}\u2103`}}</b-col>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
					</b-row>
					<b-row>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold">{{$t('humidity')}}</b-col>
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right">{{item.humidity}}%</b-col>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
					</b-row>
					<b-row>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold">{{$t('pressure')}}</b-col>
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right">{{item.pressure}}&nbsp;hPa</b-col>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
					</b-row>
					<b-row>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold">{{$t('cloudiness')}}</b-col>
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right">{{item.clouds}}%</b-col>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
					</b-row>
					<b-row>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold">{{$t('dew point')}}</b-col>
						<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-right">{{`${item.dew_point}\u2103`}}</b-col>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
					</b-row>
					<b-row>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold">{{$t('visibility')}}</b-col>
						<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right">{{item.visibility}} m</b-col>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
					</b-row>
					<b-row>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold">
							{{$t('wind')}}
						</b-col>
						<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-right">
							{{`${windDirection(item.wind_deg)} ${item.wind_speed} km/h`}}
						</b-col>
						<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
					</b-row>
				</b-container>
			</b-card-text>
		</b-card>
	</b-card-group>
	<span v-else>. . .</span>
	<div style="margin-top: 15px">
		<b-pagination
			v-if="!loading"
			v-model="currentPage"
			:total-rows="forecastData.hourly.length"
			:per-page="perPage"
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
</template>

<script>
import { getCityLatLon } from '../controllers/backend'

export default {
	name: 'DetailedForecast',
	
	props: {
		lat: {
			type: Number,
			required: true
		},
		lon: {
			type: Number,
			required: true
		},
		perPage: {
			type: Number,
			required: true,
			validator: prop => typeof prop === 'number' && Number.isInteger(prop) && prop > 0
		}
	},

	data() {
		return {
			currentPage: 1,
			loading: true,
			forecastData: []
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
 		}
	},

	computed: {
		coords() {
			return { lat: this.lat, lon: this.lon };
		}
	},

	async mounted() {
		this.loading = true;
		const data = await getCityLatLon(this.lat, this.lon);
		this.forecastData = data;
		this.loading = false;	
	},

	watch: {
		async coords(newValue, oldValue) {
			this.loading = true;
			this.currentPage = 1;
			const data = await getCityLatLon(newValue.lat, newValue.lon);
			this.forecastData = data;
			this.loading = false;	
		}
	}
}
</script>