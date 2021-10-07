// example taken from b-alert component documentation
// Alert must be inside a container so that it inherits its height & width properties
<template>
<b-alert
  :show="show"
  dismissible
  fade
  :variant="type"
  @dismissed="closeAlert();"
  style="height: inherit; width: inherit; overflow: inherit;"
>
  {{message}}
</b-alert>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'Alert',

  computed: {
    ...mapGetters({
      show: 'alert/getShow',
      type: 'alert/getType',
      message: 'alert/getMessage'
    })
  },

  methods: {
    closeAlert() {
      this.$store.dispatch('alert/clear')
    }
  }
}
</script>