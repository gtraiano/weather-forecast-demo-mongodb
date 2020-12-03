<!--
  Copyright (c) 2019

  Detailed forecasts page

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->


<template>
    <b-container fluid>
        <br/>
        <b-row align-v="center">
            <b-col cols="1"/>
            
            <b-col cols="1" :style="{textAlign: 'left'}">
                <Controls
                    :variables="variables"
                    :selectedVariable="selectedVar"
                    v-on:selected_var="selectedVar = $event;"
                />
            </b-col>

            <b-col cols="8">
                <h3>{{$t('overview')}}</h3>
            </b-col>
            
            <b-col cols="1"/>
            <!--b-col :style="{textAlign: 'center'}"><b>{{ tableTitle }}</b></b-col-->
        </b-row>
        
        <b-row>    
        </b-row>
        
        <b-row md="12" class="mt-4">
            <b-col/>
            
            <b-col cols="10">
                <!-- forecasts table renders only if cityData is populated -->
                <ForecastsTable v-if="cityData && cityData.length"
                    :forecastData="cityData"
                    :tableItems="tableCells"
                    :tableFields="tableHeader"
                    :selectedRow="selectedCity"
                    :sortBy="tableSortBy"
                    :sortDesc="tableSorted"
                    :tableStyle="tableStyle"
                    :tableTitle="tableTitle"
                    :sortCompare="sortCompare"
                    @selectedRowUpdate="(index, value) => { $emit('selectedRowUpdate', index, value); }"
                    @sortingChanged="value => { $emit('sortingChanged', value) }"
                    @showPlot="$emit('showPlot');"
                    @showDetailedForecast="$emit('showDetailedForecast')"
                    ref="table"
                />
                <!-- otherwise display no forecasts message -->
                <h3 v-else>{{ $t('no forecasts') }}</h3>
            </b-col>
            
            <b-col/>
        </b-row>
        
        <b-container v-if="selectedCity !== -1 && showDetailedForecast" fluid>
          <b-row>
            <b-col/>

            <b-col cols="10">
                  <b-button-close @click="showPlot ? showDetailedForecast = false : selectedCity = -1; showDetailedForecast = false;" />
            </b-col>
            
            <b-col/>
          </b-row>
          
          <b-row>
              <b-col/>
              
              <b-col cols="10">
                  <DetailedForecast
                      :lat="cityData[selectedCity].coords.lat"
                      :lon="cityData[selectedCity].coords.lon"
                      :perPage=6
                  />
              </b-col>
              
              <b-col/>
          </b-row>
        </b-container>

        <!-- plot renders only if a city is selected -->
        <b-container v-if="selectedCity !== -1 && showPlot" fluid>
            <b-row>
                <b-col/>
                
                <b-col cols="1" :style="{textAlign: 'left'}">
                    <!-- plot timeline duration control -->
                    <b-form-spinbutton id="endHours" :value="endHours" min="1" max="48" size="sm" inline @change="endHours = $event"
                    />
                    <span>{{ $t('hours') }}</span>
                </b-col>
                
                <b-col cols="8">
                    <h4>
                        {{ $t('plot for') }} {{ cityData[selectedCity].name[$i18n.locale] }}
                    </h4>
                </b-col>
                
                <b-col>
                    <!-- container close button -->
                    <b-button-close @click="showDetailedForecast ? showPlot = false : selectedCity = -1; showPlot = false;" />
                </b-col>
                
                <b-col/>
            </b-row>
            
            <b-row>
              <b-col/>
              
              <b-col cols="10">
                  <LineChart :chart-data="preparePlotData(endHours, selectedVar)" />
              </b-col>
              
              <b-col/>
            </b-row>
        </b-container>

    </b-container>
</template>

<script>
import Controls from './Controls.vue'
import LineChart from './LineChart.vue'
import { mapGetters } from 'vuex'
import ForecastsTable from './ForecastsTable.vue'
import DetailedForecast from './DetailedForecast.vue'

const hoursPassed = (end, start) => {
    return Math.floor((end - start)/3600000);
}

export default {
  name: 'Forecasts',

  data() {
      return {
          variables: ['temperature', 'humidity', 'pressure'],
          selectedVar: 'temperature',
          selectedCity: -1, // index of city in cityData
          endHours: 48, // timeline duration in hours for plot
          tableSortBy: null, // field name to sort forecasts table by
          tableSorted: null, // forecasts table is sorted (null: no, true: desc, false: asc)
          tableStyle: { height: '70vh' }, // table css styling
          showPlot: false,
          showDetailedForecast: false,
          overviewColumns: 6 // number of forecast columns in overview table
      }
  },

  components: {
      Controls,
      LineChart,
      ForecastsTable,
      DetailedForecast
  },

  methods: {
      findCityIndex (coords) {
      /* find city index */
          return this.cityData.findIndex(city => {
              return city.coords.lat == coords.lat && city.coords.lon == coords.lon
          })
      },

      preparePlotData: function (endHours, variable) {
      /* prepares dataset for plot */
          let chartdata = this.chartData[this.selectedCity].variables[this.selectedVar] // get selected variable measurements
          delete chartdata.title // remove plot title
          chartdata = {...chartdata, labels: chartdata.labels.slice(0, endHours)} // x-axis points for endHours hours

          return chartdata
      },

      findSelectedCityIndexSorted() {
      /* return selected city index in sorted names table */
          return this.sortedCityNames.findIndex(name => name === this.cityData[this.selectedCity].name[this.$i18n.locale]);
      },

      sortCompare(aRow, bRow, key = 'city', sortDesc) {
      /* sort function to be used in table for city column */
          const a = aRow[key]
          const b = bRow[key]
          
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
  },

  computed: {
      tableCells: function () {
      /* prepares table rows */
          let data_for_table = [];
          let now = Date.now();
          let nowIndex = null;
          
          this.cityData.forEach(city => {
              nowIndex = city.forecast.hourlyDt.findIndex(dt => hoursPassed(now, dt) === 0) // find closest datetime to now + first column hours
              let curr_data = {
                  'city' : { name: city.name[this.$i18n.locale], coords: city.coords } // city column
              }
              for (let counter = 0; counter < this.overviewColumns && nowIndex !== -1; counter++) // if nowIndex === =1, there is no up to date forecast data to pass to the table
              {
                  curr_data[String(counter)] = city.forecast[this.selectedVar][nowIndex + counter*this.overviewColumns]; // hour forecast columns
              }
              data_for_table.push(curr_data);
          });
          return data_for_table;
      },

      tableHeader: function () {
      /* prepares table fields (i.e. column names) */
          let currentDate = new Date();
          let options = { weekday: 'short', hour: '2-digit'};
          let fields = [
              {
                key: 'city', // key name according to locale
                label: this.$t('city'),
                sortable: true
              }
          ];

          for (let counter = 0; counter < this.overviewColumns; counter++)
          {
              currentDate.setHours(currentDate.getHours() + counter*this.overviewColumns)
              let new_label = {
                  key: String(counter),
                  sortable: false,
                  /*label: this.$i18n.locale === 'en' // dates according to locale
                      ? currentDate.toLocaleDateString("en-US",options)
                      : currentDate.toLocaleDateString("el-GR",options)*/
                  label: currentDate.toLocaleDateString(this.$i18n.locale, options)
              }
              fields.push(new_label);
          }
        return fields;
      },

      tableTitle: function () {
          let unit_map = {
              "temperature" : "\u2103",
              "pressure" : "hPa",
              "humidity" : "%",
          };
          return `${this.$t(this.selectedVar)} ${this.$t('in')} ${unit_map[this.selectedVar]}`;
      },

      sortedCityNames() {
      /* returns sorted city names table according to locale & table sorting (asc or desc) */
          return this.cityData.map(row => row.name[this.$i18n.locale]).sort(
              (a, b) => {
                  if(this.tableSorted)
                      return b >= a;
                  else
                      return b < a;
              }
          );
      },

      ...mapGetters({
          cityData: 'allCityData/getAllCityData',
          chartData: 'chartData/getChartData',
          locale: 'locale/getLocale'
      })
  },

  watch: {
      selectedCity(newValue, oldValue) {
          this.tableStyle.height = newValue === -1 ? '70vh' : '25vh';
          
          if (newValue === -1) { // plot is closed
              this.$refs.table.scrollToRow(0);
          }
          else if (oldValue === -1) { // plot is opened
              if (this.tableSorted === null) {
                  this.$refs.table.scrollToRow(newValue); // scroll to index directly
              }
              else {
                  this.$refs.table.scrollToRow(this.findSelectedCityIndexSorted());
              }
          }
      },

      tableSorted(newValue, oldValue) {
          if(this.selectedCity !== -1) { // scroll sorted table to follow selected city
              this.$refs.table.scrollToRow(this.findSelectedCityIndexSorted());
          }
          if(newValue === null) { // scroll unsorted table to follow selected city
              this.$refs.table.scrollToRow(this.selectedCity);
          }
      },

      locale() {
          if(this.tableSortBy) {
              this.tableSortBy = this.$t('city'); // translate sort key
              if(this.selectedCity !== -1) {
                  this.$refs.table.scrollToRow(this.findSelectedCityIndexSorted()); // scroll table to correct selected city row when table is sorted
              }
          }
      }
  },
  
  async created() {
      if(!this.cityData.length){
        console.log('Load our data first');
        await this.$store.dispatch('allCityData/setAllCityDataAsync');
      }
  },

  mounted() {
       //event listeners
      this.$on('selectedRowUpdate', (index, coords) => { this.selectedCity = this.findCityIndex(coords); });
      this.$on('sortingChanged', ({ sortBy, sortDesc }) => {
          this.tableSortBy = sortBy;
          this.tableSorted = sortDesc;
      });
      this.$on('showPlot', () => { this.showPlot = true; });
      this.$on('showDetailedForecast', () => { this.showDetailedForecast = true; });
  }
}
</script>