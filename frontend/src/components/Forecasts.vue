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
                <b-button-group>
                    <!-- table varaible -->
                    <Controls
                        :variables="variables"
                        :selectedVariable="selectedVar"
                        v-on:selected_var="selectedVar = $event;"
                    />
                    <!-- table settings -->
                    <b-dropdown size="sm">
                        <template #button-content>
                            {{$t('options')}}
                        </template>
                        <!-- forecast columns # -->
                        <b-dropdown-form>
                            <label class="text-nowrap">{{$t('table columns')}}</label>
                            <b-form-spinbutton
                                inline
                                :value="overviewColumns"
                                size="sm"
                                min="1"
                                max="48"
                                @change="overviewColumns = $event"
                            />
                        </b-dropdown-form>
                        <!-- forecast columns period -->
                        <b-dropdown-form>
                            <label class="text-nowrap">{{$t('period')}}</label>
                            <b-form-spinbutton
                                inline
                                :value="overviewPeriod"
                                size="sm"
                                min="1"
                                max="24"
                                @change="overviewPeriod = $event"
                            />
                        </b-dropdown-form>
                    </b-dropdown>
                </b-button-group>
            </b-col>

            <b-col cols="8">
                <h3>{{$t('overview')}}</h3>
            </b-col>
            
            <b-col cols="1"/>
        </b-row>
        
        <b-row>    
        </b-row>

        <!-- forecast overview table -->
        <b-row md="12" class="mt-4">
            <b-col/>
            
            <b-col cols="10">
                <h5 v-if="cityData && cityData.length">{{tableTitle}}</h5>
                <!-- forecasts table renders only if cityData is populated -->
                <ForecastsTableCustom v-if="cityData && cityData.length"
                    :forecastData="cityData"
                    :tableItems="tableCells"
                    :tableFields="tableHeader"
                    :selectedRow="selectedCity"
                    :tableStyle="tableStyle"
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
        
        <!-- detailed forecast -->
        <b-container v-if="selectedCity !== -1 && showDetailedForecast" fluid>
          <b-row>
              <b-col/>

              <b-col cols="9">
                  <h4>{{cityData[selectedCity].name[this.$i18n.locale]}}</h4>
              </b-col>
              <b-col cols="1">
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
                    <b-form-spinbutton
                        :value="endHours"
                        min="1"
                        max="48"
                        size="sm"
                        inline
                        @change="endHours = $event"
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
                  <!--LineChart :chart-data="preparePlotData(endHours, selectedVar)" /-->
                  <LineChartAsync :chartData="preparePlotData(endHours, selectedVar)" />
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
import LineChartAsync from './LineChartAsync.vue'
import ForecastsTableCustom from './ForecastsTableCustom.vue'

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
          selectedCityIndexSorted: -1,
          endHours: 48, // timeline duration in hours for plot
          tableSorted: false, // forecasts table is sorted
          tableStyle: { height: '70vh' }, // table css styling
          showPlot: false,
          showDetailedForecast: false,
          overviewColumns: 8, // number of forecast columns in overview table
          overviewPeriod: 4 // hours between forecast columns
      }
  },

  components: {
      Controls,
      LineChart,
      ForecastsTable,
      DetailedForecast,
      LineChartAsync,
      ForecastsTableCustom
  },

  methods: {
      findCityIndex (coords) {
      /* find city index */
          return this.cityData.findIndex(city => {
              return city.coords.lat == coords.lat && city.coords.lon == coords.lon
          })
      },

      preparePlotData: async function (endHours, variable) {
      /* prepares dataset for plot */
          let chartdata = (await this.chartData[this.selectedCity]).variables[this.selectedVar];
          delete chartdata.title // remove plot title
          chartdata = {...chartdata, labels: chartdata.labels.slice(0, endHours)} // x-axis points for endHours hours

          return chartdata
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
                  'city' : { name: city.name[this.$i18n.locale], coords: city.coords }, // city column
                  'country': city.country[this.$i18n.locale],
                  'continent': this.$t(city.continent.toLowerCase())
              }
              for (let counter = 0; counter < this.overviewColumns && nowIndex !== -1 && nowIndex + counter*this.overviewPeriod < city.forecast[this.selectedVar].length; counter++) // if nowIndex === =1, there is no up to date forecast data to pass to the table
              {
                  curr_data[String(counter)] = city.forecast[this.selectedVar][nowIndex + counter*this.overviewPeriod]; // hour forecast columns
              }
              data_for_table.push(curr_data);
          });
          return data_for_table;
      },

      tableHeader: function () {
      /* prepares table fields (i.e. column names) */
          let currentDate = new Date();
          let now = Date.now();
          let options = { weekday: 'short', hour: '2-digit'};
          let fields = [
              {
                key: 'city',
                label: this.$t('city'),
                sortable: true
              },
              {
                key: 'country',
                label: this.$t('country'),
                sortable: true
              },
              {
                key: 'continent',
                label: this.$t('continent'),
                sortable: true
              }
          ];

          for (let counter = 0; counter < this.overviewColumns; counter++)
          {
              //currentDate.setTime(currentDate.getTime() + counter*this.overviewPeriod*60*60*1000)
              currentDate = new Date(now + counter*this.overviewPeriod*60*60*1000);
              let new_label = {
                  key: String(counter),
                  sortable: false,
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

      ...mapGetters({
          cityData: 'allCityData/getAllCityData',
          chartData: 'chartData/getChartData'
      })
  },

  watch: {
      overviewColumns() {
          window.localStorage.setItem('overviewColumns', JSON.stringify(this.overviewColumns))
      },

      overviewPeriod() {
          window.localStorage.setItem('overviewPeriod', JSON.stringify(this.overviewPeriod))
      }
  },
  
  async created() {
      if(!this.cityData.length) {
          console.log('Load our data first');
          await this.$store.dispatch('allCityData/setAllCityDataAsync');
      }

      this.overviewColumns = JSON.parse(window.localStorage.getItem('overviewColumns')) || this.overviewColumns;
      this.overviewPeriod = JSON.parse(window.localStorage.getItem('overviewPeriod')) || this.overviewPeriod;
  },

  mounted() {
      this.$on('selectedRowUpdate', (index, coords) => {
          this.selectedCity = this.findCityIndex(coords);
          this.selectedCityIndexSorted = index;
          
          this.tableStyle.height = this.selectedCity === -1 ? '70vh' : '25vh';
          console.log('tableSorted', this.tableSorted, 'selectedCity', this.selectedCity, 'selectedCityIndexSorted', this.selectedCityIndexSorted);
          if(this.tableSorted) {
              //this.selectedCity !== -1 ? this.$refs.table.scrollToRow(this.selectedCityIndexSorted) : null;
              this.selectedCity ? this.$refs.table.scrollToRow(this.selectedCityIndexSorted) : null;
          }
          else if(!this.tableSorted) {
              this.selectedCity === -1 ? this.$refs.table.scrollToRow(0) : null;
          }
      });

      this.$on('sortingChanged', value => {
          this.tableSorted = value;
      });

      this.$on('showPlot', () => { this.showPlot = true; });
      
      this.$on('showDetailedForecast', () => { this.showDetailedForecast = true; });
  }
}
</script>