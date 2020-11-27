<!--
  Copyright (c) 2019

  Control buttons component

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
    <b-button-toolbar class="d-sm-inline-flex">
        <b-dropdown class="mx-1" :text="$t('variable')" size="sm">
            <b-dropdown-item
                v-for="variable in variables"
                :key="variable"
                class="container-fluid p-0 m-0"
                @click="$emit('selected_var', variable)"
            >
                <span v-if="selectedVariable && selectedVariable === variable"> <b> {{ $t(variable) }} </b> </span>
                <span v-else>{{ $t(variable) }}</span>
            </b-dropdown-item>

        </b-dropdown>
    </b-button-toolbar>
</template>

<script type = "text/javascript" >
export default {
  props: {
    variables: {
      type: Array,
      required: true
    },

    selectedVariable: {
      type: String,
      required: false
    }
  }
};
</script>

<style scoped>
.footer {
    font-size: small;
}

div.control {
    margin-top: 5px;
}
</style>
