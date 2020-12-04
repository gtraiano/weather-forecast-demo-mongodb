<!--
  Copyright (c) 2019

  Forecasts overview table, plus actions for each city

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
<b-table v-if="forecastData && forecastData.length"
    striped hover borderless sticky-header
    small head-variant="light"
    :style="tableStyle"
    :items="tableItems"
    :fields="fields()"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    :sort-compare="sortCompare"
    @sort-changed="sortingChanged"
    @click.native.right.prevent
    id="table"
    class="text-nowrap"
>
	<!-- table title (above header) -->
  <template v-if="tableTitle" #thead-top="data">
		<b-tr>
			<b-th :colspan="data.columns" :style="{fontSize: '125%'}">
				{{ tableTitle }}
			</b-th>
		</b-tr>
	</template>
	
  <!-- table header -->
  <template v-slot:head()="data"><!-- header custom rendering-->
		<!-- on sortable field, clear sorting on right click -->
		<span v-if="data.field.sortable"
			@click.right.prevent="sortingChanged({ sortBy: null, sortDesc: null })"
		>
		    {{ data.label }}
		</span>
		<!-- on regular field, disable right click context menu -->
    	<span v-else @click.right.prevent>
    		{{ data.label }}
    	</span>
    </template>
    
    <!-- city name column -->
    <template v-slot:cell(city)="data">
        <!-- clickable city name to load plot -->
        <a href="" 
        	v-on:click.prevent="selectedRowUpdate(data.index, data.value.coords); $emit('showDetailedForecast');"
        	:title="`lat: ${data.value.coords.lat} lon: ${data.value.coords.lon}`"
        >
            <!-- no city selected, render all without formatting -->
            <span v-if="selectedRow === -1">
                {{ data.value.name }}
            </span>
            <!-- city selected, make selected city name bold -->
            <strong v-else-if="data.value.name === forecastData[selectedRow].name[$i18n.locale]">
                {{ data.value.name }}
            </strong>
            <!-- city selected, render not selected city names without formatting -->
            <span v-else>
                {{ data.value.name }}
            </span>
        </a>
    </template>
    
    <!-- actions column -->
    <template v-slot:cell(actions)="data">
        <!-- plot icon -->
        <a
            class="ml-1 mr-1"
            href=""
            @click.prevent="plotCity(data.item['city'])"
            style="color: unset"
        >
          <b-icon-graph-up :title="$t('plot')" />
        </a>
        <!-- refresh forecast data icon -->
      	<a
            class="ml-1 mr-1"
      		  href=""
      		  @click.prevent="updateCityForecast(data.item['city'])"
      		  style="color: unset"
      	>
      		  <b-icon-arrow-clockwise :title="$t('refresh forecast data')" />
      	</a>
        <!-- remove city icon -->
      	<a
            class="ml-1 mr-1"
      		  href=""
      		  @click.prevent="removeCity(data.item['city'])"
      		  style="color: unset"
      	>
      		  <b-icon-trash :title="$t('delete')" />
      	</a>
    </template>
    
    <!-- forecast values column -->
    <template v-slot:cell()="data">
        <span v-if="!['city', 'actions'].includes(data.field) && !data.value">&mdash;</span><!-- em dash on empty cells -->
        <span v-else>{{data.value}}</span>
    </template>
</b-table>
</template>

<script>
import { BIconTrash, BIconArrowClockwise, BIconGraphUp } from 'bootstrap-vue';

export default {
  	name: 'ForecastsTable',
  	
  	components: {
  		  BIconTrash,
  		  BIconArrowClockwise,
        BIconGraphUp
  	},

  	props: {
    		forecastData: {
    			 type: Array,
    			 required: true
    		},

    		tableItems: { // table rows
    			 type: Array,
    			 required: true
    		},

    		tableFields: { // table fields
    			 type: Array,
    			 required: true
    		},

    		sortBy: { // table field name to sort by
    			 type: String,
    			 required: false,
    			 default: null
    		},

    		sortDesc: { // sort direction (true: desc, false: asc, null: none)
    			 type: Boolean,
    			 required: false,
    			 default: null
    		},

    		selectedRow: {
    			 type: Number,
    			 required: false,
    			 default: -1
    		},

    		tableStyle: { // css styling for table
    			 type: Object,
    			 required: false,
    			 default: function() {
    				  return { height: '70vh' };
    			 }
    		},

    		tableTitle: {
    			 type: String,
    			 required: false
    		},

    		sortCompare: {
    			 type: Function,
    			 required: false
    		}
  	},

  	methods: {
    		sortingChanged(ctx) {
            this.$emit('sortingChanged', ctx);
        },

    		selectedRowUpdate(index, value) {
    		    this.$emit('selectedRowUpdate', index, value);
    		},

    		scrollToRow(index) {
            let table = this.$el.querySelector("#table");
          	table.parentElement.style.height = this.tableStyle.height;
      		  
            if(this.selectedRow === -1) { // first scroll on table shrink
      			   // do not scroll from 1st "page" if not necessary
      			   table.parentElement.scrollTop = table.rows[0].clientHeight * index + table.tHead.clientHeight < table.parentElement.clientHeight ? 0 : table.rows[0].clientHeight * index;
      		  }
      		  else { // scroll while table shrinked
      			   table.parentElement.scrollTop = table.rows[0].clientHeight * index;
      		  }
      	},

      	fields() {
      		  return [{ key: 'actions', label: this.$t('actions'), sortable: false }, ...this.tableFields];
      	},

      	async removeCity(city) {
      		  await this.$store.dispatch('action/delete', city);
      		  this.$emit('selectedRowUpdate', -1, {});
      	},

      	async updateCityForecast(city) {
      		  await this.$store.dispatch('allCityData/updateCityForecastDataAsync', city);
      	},

        plotCity(city) {
            this.selectedRowUpdate(city.index, city.coords);
            this.$emit('showPlot');
        },
  	}
}
</script>