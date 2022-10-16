<template>
<div
    id="app"
    tabindex="0"
    class="container-fluid"
>
    <h1>{{$t('api key not set')}}</h1>
    <h6 style="margin-top: 20vh">{{$t('set api key')}}</h6>
    <b-form
        @submit="$event.preventDefault(); setOWApiKey($event.srcElement[0]._value)"
    >
        <b-form-group
            id="input-group-1"
            label-for="input-1"
            style="width: 50%; margin-left: auto; margin-right: auto;"
          >
              <b-form-input
                id="input-1"
                type="text"
                placeholder="Enter API key"
                required
                trim
              />
          </b-form-group>

          <b-button type="submit" variant="primary">Submit</b-button>
          <b-button type="reset" variant="danger">Reset</b-button>
    </b-form>
    <h5 v-html="$t('set api key warn')" style="margin-top: 2vh"></h5>
</div>
</template>

<script type="text/javascript">
export default {
	name: 'OWApiKey',
	props: {
		isOWApiKeySet: {
			type: Boolean,
			required: true
		},
		setOWApiKey: {
			type: Function,
			required: true
		}
	}
}
</script>