<script>

import Modal from "../../../share-components/modals/Modal.vue";
import {mapGetters} from "vuex";
import {mapActions} from "vuex";

export default {
    name: "ConfirmAction",

    components: {
        Modal
    },

    computed: {
        ...mapGetters("ConfirmAction", [
            "queue"
        ]),

        /**
         * Console mapping to be able to debug in template.
         * @returns {Void} With capital V
         */
        console: () => console
    },

    /**
     * Created hook: Creates event listener for legacy Radio calls (to be removed seometime).
     * @returns {void}
     */
    created () {
        Backbone.Events.listenTo(Radio.channel("ConfirmAction"), {
            "add": newAction => {
                this.addSingleAction(newAction);
            }
        });
        
        Radio.trigger("ConfirmAction", "add", {
            actionConfirmed: () => {
                console.log("CONFIRMED");
            },
            actionDenied: {
                console.log("DENIED");
            },
            copy: "copy much",
            headline: "healine1"
        });
    },

    methods: {
        ...mapActions("ConfirmAction", [
            "actionConfirmed",
            "actionDenied",
            "addSingleAction",
            "initialize"
        ]),

        /**
         * When closing the modal, update all alerts' have-been-read states.
         * @returns {void}
         */
        onModalHid: function () {
            this.cleanup();
        }
    }
};
</script>

<template>
    <div>
        <Modal
            :show-modal="readyToShow"
            @modalHid="onModalHid"
        >
            <div id="actionDescriptionContainer">
                <h3>
                    Foo
                </h3>

                <p
                    v-if="singleAlert.mustBeConfirmed"
                    class="confirm"
                >
                    copy
                </p>
            </div>
            
            <div id="conformationContainer">
                <button
                    @click="actionConfirmed"
                >
                    OK
                </button>
                <button
                    @click="actionDenied"
                >
                    Abbrechen
                </button>
            </div>
        </Modal>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";



</style>