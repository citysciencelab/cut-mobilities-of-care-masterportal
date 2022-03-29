<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "MobilityDataForm",
    components: {},
    props: {
        // The geometry index of the mobility data segment
        geometryIndex: {
            type: Number,
            default: null
        },
        // The start time of the mobility data segment
        startTime: {
            type: String,
            default: ""
        },
        // The end time of the mobility data segment
        endTime: {
            type: String,
            default: ""
        },
        // The cost of the mobility data segment
        cost: {
            type: Number,
            default: 0.0
        },
        // The comment to the mobility data segment
        comment: {
            type: String,
            default: ""
        },
        // Whether to show the cost input or not
        showCostInput: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants },
            openStartTimeMenu: false,
            openEndTimeMenu: false
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", Object.keys(mutations)),
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),

        /**
         * Sets the start time for the opened mobility data segment
         * @param {String}  newStartTime   The selected start time
         * @returns {void}
         */
        onSetStartTime(newStartTime) {
            this.setMobilityDataProperties({
                geometryIndex: this.geometryIndex,
                startTime: newStartTime
            });
        },

        /**
         * Sets the end time for the opened mobility data segment
         * @param {String}  newEndTime   The selected end time
         * @returns {void}
         */
        onSetEndTime(newEndTime) {
            this.setMobilityDataProperties({
                geometryIndex: this.geometryIndex,
                endTime: newEndTime
            });
        },

        /**
         * Sets the cost for the opened mobility data segment
         * @param {Event}   event   The event fired by changing the cost input
         * @returns {void}
         */
        onSetCost(event) {
            const cost = Number(event.target.value);
            this.setMobilityDataProperties({
                geometryIndex: this.geometryIndex,
                cost
            });
        },

        /**
         * Sets the comment for the opened mobility data segment
         * @param {Event}   event   The event fired by changing the comment input
         * @returns {void}
         */
        onSetComment(event) {
            const comment = event.target.value;
            this.setMobilityDataProperties({
                geometryIndex: this.geometryIndex,
                comment
            });
        }
    }
};
</script>

<template lang="html">
    <div class="mobility-data-form">
        <div class="form-group mobility-data-form-time">
            <div>
                <label class="form-label">
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.label.startTime"
                        )
                    }}
                </label>
                <v-menu
                    ref="menu"
                    v-model="openStartTimeMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    max-width="290px"
                    min-width="290px"
                    offset-y
                    right
                    attach="#tool-mobilityDataDraw"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <input
                            class="form-control mobility-data-form-time-input"
                            type="time"
                            :value="startTime"
                            placeholder="start time"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        />
                    </template>
                    <v-time-picker
                        v-if="openStartTimeMenu"
                        :value="startTime"
                        :max="endTime"
                        format="24hr"
                        full-width
                        @input="onSetStartTime"
                    ></v-time-picker>
                </v-menu>
            </div>

            <div>
                <label class="form-label">
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.label.endTime"
                        )
                    }}
                </label>
                <v-menu
                    ref="menu"
                    v-model="openEndTimeMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    max-width="290px"
                    min-width="290px"
                    offset-y
                    left
                    attach="#tool-mobilityDataDraw"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <input
                            class="form-control mobility-data-form-time-input"
                            type="time"
                            :value="endTime"
                            placeholder="end time"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        />
                    </template>
                    <v-time-picker
                        v-if="openEndTimeMenu"
                        :value="endTime"
                        :min="startTime"
                        format="24hr"
                        full-width
                        @input="onSetEndTime"
                    ></v-time-picker>
                </v-menu>
            </div>
        </div>

        <div class="form-group" v-if="showCostInput">
            <label class="form-label">
                {{ $t("additional:modules.tools.mobilityDataDraw.label.cost") }}
            </label>
            <input
                class="form-control"
                type="number"
                min="0"
                step="0.01"
                :value="cost"
                @change="onSetCost"
            />
        </div>

        <div class="form-group">
            <label class="form-label">
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.label.routeComment"
                    )
                }}
            </label>
            <textarea
                class="form-control"
                :value="comment"
                @change="onSetComment"
            />
        </div>
    </div>
</template>

<style lang="less" scoped>
.mobility-data-form {
    &-time {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 10px;
        align-items: center;
    }

    &-time-input {
        background: #fff;
    }
}
</style>
