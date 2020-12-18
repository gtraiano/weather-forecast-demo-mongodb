<!--
  Copyright (c) 2019

  Forecasts overview table, with multiple fields sorting and actions for each city

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
<b-table
    v-if="rows && rows.length"
    striped hover borderless sticky-header
    small head-variant="light"
    no-local-sorting
    :style="tableStyle"
    :items="rows"
    :fields="addActionsField()"
    @click.native.right.prevent
    id="table"
    class="text-nowrap"
>	
  <!-- table header -->
  <template v-slot:head()="data"><!-- header custom rendering-->
  		<!-- on sortable field, clear sorting on right clicking sorted field header -->
      <div 
          v-if="data.field.sortable"
          @click.left="addSortField(data.field.key)"
          @click.right.prevent="removeSortField(data.field.key)"
      >
          <div class="w-100" style="display: inline-block; position: relative;">{{ data.label }}</div>
          <div class="w-5" style="display: inline-block; position: relative; left: -5%;"><!-- custom sort icon -->
              <b-icon-chevron-up v-if="sortFields[data.field.key]" />
              <b-icon-chevron-down v-else-if="sortFields[data.field.key] === false" />  
          </div>
          
      </div>
		<!-- on regular field, disable right click context menu -->
    	<span
          v-else
          @click.right.prevent
      >
    		  {{ data.label }}
    	</span>
    </template>

    <template v-slot:cell(index)="data">
        {{data.index + 1}}
    </template>
    
    <!-- city name column -->
    <template v-slot:cell(city)="data">
        <!-- clickable city name to load plot -->
        <a
            href="" 
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
import { BIconTrash, BIconArrowClockwise, BIconGraphUp, BIconChevronUp, BIconChevronDown } from 'bootstrap-vue';

export default {
  	name: 'ForecastsTableCustom',
  	
  	components: {
  		  BIconTrash,
  		  BIconArrowClockwise,
        BIconGraphUp,
        BIconChevronDown,
        BIconChevronUp
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
    		}
  	},

    data() {
        return {
            rows: [], // local copy of table items
            sortFields: {} // sortable fields order (true: asc, false: desc, null: none)
        }
    },

    created() {
        this.rows = [...this.tableItems];
        this.tableFields.filter(field => field.sortable === true).forEach(field => {
            this.sortFields[field.key] = null;
        });
    },

  	methods: {
    		selectedRowUpdate(index, value) {
    		    this.$emit('selectedRowUpdate', index, value);
    		},

        sortingChanged() {
            const isSorted = Object.values(this.sortFields).some(value => value != null);
            if(!isSorted && this.selectedRow !== -1) { // emit original selected row index when sorting cleared
                this.$emit('selectedRowUpdate', this.selectedRow, this.forecastData[this.selectedRow].coords);
            }
            this.$emit('sortingChanged', isSorted);
        },

    		scrollToRow(index) {
            let table = this.$el.querySelector("#table");
      		  
            if(this.selectedRow === -1) { // first scroll on table shrink
      			   // do not scroll from 1st "page" if not necessary
               table.parentElement.scrollTop = table.rows[index].offsetTop < table.parentElement.clientHeight ? 0 : table.rows[index].offsetTop;
      		  }
      		  else { // scroll while table shrinked
      			   table.parentElement.scrollTop = table.rows[index].offsetTop;
      		  }
      	},

      	addActionsField() {
      		  return [
                { key: 'actions', label: this.$t('actions'), sortable: false },
                { key: 'index', label: '#', sortable: false },
                ...this.tableFields.map( field => ( field.sortable ? { ...field, thStyle: {'background-image': 'none'} } : field ) ) // remove standard sort icon from sortable fields
            ];
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

        addSortField(key) {
            this.sortFields = { ...this.sortFields, [key]: !this.sortFields[key] };
        },

        removeSortField(key) {
            this.sortFields = { ...this.sortFields, [key]: null };
        },

        sortCompare(a, b, key, asc) {
        // key: sort key
        // asc: true if ascending
            return key !== 'city' // city needs to be sorted by city.name
                ? b[key].localeCompare(a[key], this.$i18n.locale, { sensitivity: 'base', ignorePunctuation: true } ) * (asc ? -1 : 1)
                : b.city.name.localeCompare(a.city.name, this.$i18n.locale, { sensitivity: 'base', ignorePunctuation: true } ) * (asc ? -1 : 1)
        }
    },

    watch: {
        sortFields() {
            // sort local rows copy
            let table = [...this.tableItems];
            Object.entries(this.sortFields).forEach(([key, order]) => {
                if(order !== null)
                    table.sort((a,b) => this.sortCompare(a, b, key, order));
            });
            this.rows = table;
            
            // send events
            this.sortingChanged();
            if(this.selectedRow !== -1) {
                const index = this.rows.findIndex(row => row.city.coords.lon === this.forecastData[this.selectedRow].coords.lon && row.city.coords.lat === this.forecastData[this.selectedRow].coords.lat)
                this.selectedRowUpdate(index, this.forecastData[this.selectedRow].coords);
            }
        },

        tableItems() {
            let table = [...this.tableItems];
            Object.entries(this.sortFields).forEach(([key, order]) => {
                if(order !== null)
                    table.sort((a,b) => this.sortCompare(a, b, key, order));
            });
            this.rows = table;

            if(this.selectedRow !== -1) {
                const index = this.rows.findIndex(row => row.city.coords.lon === this.forecastData[this.selectedRow].coords.lon && row.city.coords.lat === this.forecastData[this.selectedRow].coords.lat)
                this.selectedRowUpdate(index, this.forecastData[this.selectedRow].coords);
            }
        }
    }
}
</script>