<!--
  Copyright (c) 2019

  Modal component

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @version 1.0
 -->

<template>
    <b-modal centered :id="modalId">
    <div class="footer" style="text-align: justify;">
        {{ text }}
    </div>
        <div slot="modal-footer" class="w-100">
            <b-button
                variant="primary"
                size="sm"
                class="float-right"
                @click="$bvModal.hide(modalId)"
                >
                    OK
            </b-button>
        </div>
    </b-modal>
</template>

<script type = "text/javascript" >
export default {
    name: 'Modal',
    props: {
        modalId: {
            type: String,
            required: true,
        },
        text: {
            type: String,
        }
    },
};
</script>
<style>
.footer {
    font-size: small;
}
</style>
