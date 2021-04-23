<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersOrientation";
import mutations from "../../store/mutationsOrientation";
export default {
    name: "PoiChoice",
    computed: {
        ...mapGetters("controls/orientation", Object.keys(getters)),
        choices () {
            return {
                "currentPosition": this.$t("common:modules.controls.orientation.poiChoiceCurrentPostion"),
                "customPosition": this.$t("common:modules.controls.orientation.poiChoiceCustomPostion")
            };
        }
    },
    mounted () {
        this.show();
    },
    methods: {
        ...mapMutations("controls/orientation", Object.keys(mutations)),

        /**
         * Hides the modal.
         * @returns {void}
         */
        hidePoiChoice () {
            this.setShowPoiChoice(false);
        },

        /**
         * Show the modal.
         * @returns {void}
         */
        show () {
            this.$el.style.display = "block";
        },

        /**
         * Getting the poi option
         * @param {Object} evt click radio button event
         * @returns {void}
         */
        setPoiOption (evt) {
            this.setPoiMode(evt?.target?.value);
            this.setCurrentPositionEnabled(this.poiMode === "currentPosition");
        },

        /**
         * Confirm to track the poi
         * @returns {void}
         */
        triggerTrack () {
            this.$emit("track");
            this.hidePoiChoice(false);
        },

        /**
         * Stopping the poi track
         * @returns {void}
         */
        stopPoi () {
            this.setPoiMode("currentPosition");
            this.setCurrentPositionEnabled(true);
            this.$store.dispatch("MapMarker/removePointMarker");
            this.hidePoiChoice();
        }
    }
};
</script>

<template>
    <div
        class="modal fade in poi-choice"
    >
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <span
                        class="glyphicon glyphicon-remove"
                        aria-hidden="true"
                        data-dismiss="modal"
                        :title="$t('button.close')"
                        @click="hidePoiChoice"
                    ></span>
                    <h4 class="modal-title">
                        <span class="control-icon glyphicon glyphicon-record standalone"></span>
                        {{ $t("common:modules.controls.orientation.titleGeolocatePOI") }}
                    </h4>
                </div>
                <div class="choice-content">
                    <div class="choice-title">
                        {{ $t("common:modules.controls.orientation.poiChoiceTitle") }}
                    </div>
                    <label
                        v-for="(val, key) in choices"
                        :key="val"
                        :class="key"
                    >
                        <input
                            type="radio"
                            name="poiChoice"
                            :value="key"
                            :checked="key === poiMode"
                            @change="setPoiOption"
                        >
                        {{ val }}
                    </label>
                    <button
                        class="confirm"
                        @click="triggerTrack"
                    >
                        {{ $t("common:modules.controls.orientation.poiChoiceConfirmation") }}
                    </button>
                    <button
                        class="stop"
                        @click="stopPoi"
                    >
                        {{ $t("common:modules.controls.orientation.poiChoiceStop") }}
                    </button>
                </div>
            </div>
        </div>
        <div
            class="modal-backdrop fade in"
            @click="hidePoiChoice"
        ></div>
    </div>
</template>

<style lang="less" scoped>
    .poi-choice {
        color: rgb(85, 85, 85);
        font-size: 14px;
        .modal-header {
            padding: 0;
        }
        .modal-title {
            padding: 8px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            .glyphicon {
                top: 3px;
                margin-right: 5px;
            }
        }
        .glyphicon-remove {
            font-size: 16px;
            float: right;
            padding: 12px;
            cursor: pointer;
        }
        .modal-dialog {
            z-index: 1041;
        }
        .choice-content{
            display: inline-block;
            width: 100%;
            padding: 10px;
            .choice-title {
                margin-bottom: 10px;
            }
            label {
                cursor: pointer;
                margin-right: 20px;
            }
            button {
                margin-left: 15px;
                margin-bottom: 10px;
                min-width: 60px;
                @media (max-width: 479px) {
                    margin-left: 0;
                    margin-bottom: 0;
                    width: 100%;
                    margin-top: 10px;
                }
            }
        }
    }
</style>

