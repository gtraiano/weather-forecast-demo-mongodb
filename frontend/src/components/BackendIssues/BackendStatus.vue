<template>
<div
	v-if="!isBackendOnline"
    id="app"
    tabindex="0"
>
    <!-- message -->
    <h2 style="margin-top: 50vh">{{$t('await backend')}}</h2>
    <p>
        <b-icon-lightning
            class="h1"
            animation="fade"
        />
    </p>
    <!-- present alternatives on link click -->
    <p v-if="$store.getters['preferences/getPreferences'].backend.availableProtocols.length">
        {{$t('or check other')}} <a href="" @click.prevent = "showAvailableUrls = !showAvailableUrls">{{$t('available options')}}</a>
    </p>
    <!-- backend url alternatives -->
    <div v-if="showAvailableUrls">
        <h6>Available URLs</h6>
        <div>
          <a
              v-for="available in $store.getters['preferences/getPreferences'].backend.availableProtocols.filter(p => p.status === true)"
              :key="available.protocol"
              href=""
              @click.prevent="$store.dispatch('preferences/setActiveProtocol', available.protocol)"
          >
              {{ available.url }}
          </a>
          <br>
        </div>

        <!-- set backend url manually (experimental, not working) -->
        <!--div style="margin-left: 39%; margin-right: 39%; margin-top: 2vh;">
            <h6>Set URL manually</h6>
            <b-form
                @submit="setBackendUrl($event.srcElement[0]._value)"
                @reset="$event.srcElement[0]._value = null"
            >
                <b-form-group
                    id="input-group-1"
                    label-for="input-1"
                  >
                      <b-form-input
                        id="input-1"
                        type="url"
                        placeholder="Enter backend URL"
                        required
                        trim
                      />
                  </b-form-group>

                  <b-button type="submit" variant="primary">Submit</b-button>
                  <b-button type="reset" variant="danger">Reset</b-button>
            </b-form>
        </div-->
    </div>
</div>
</template>

<script type="text/javascript">
import { BIconLightning } from 'bootstrap-vue';

export default {
	name: 'BackendStatus',
	data() {
		return {
			showAvailableUrls: false
		}
	},
	props: {
		isBackendOnline: {
			type: Boolean,
			required: true
		}
	},
	components: {
		BIconLightning
	}
}
</script>