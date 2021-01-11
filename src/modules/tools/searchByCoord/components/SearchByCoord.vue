<script>
import Tool from "../../Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSearchByCoord";
import mutations from "../store/mutationsSearchByCoord";
import state from "../store/stateSearchByCoord";

export default {
    name: "SearchByCoord",
    components: {
        Tool
    },
    data: function () {
        return {
            mapElement: document.getElementById("map"),
            currentCoordinateSystem: "ETRS89"
        };
    },
    computed: {
        ...mapGetters("Tools/SearchByCoord", Object.keys(getters)),
        coordinatesEastingExample: function () {
            return state.coordinatesEastingExample;
        },
        coordinatesNorthingExample: function () {
            return state.coordinatesNorthingExample;
        },
        /**
         * Must be a two-way computed property, because it is used as v-model for select-Element, see https://vuex.vuejs.org/guide/forms.html.
         */
        selectedCoordinates: {
            get () {
                return state.selectedCoordinates;
            },
            set (newValue) {
                this.setSelectedCoordinates(newValue);
            }
        }
    },
    created () {
        this.$on("close", this.close);
        this.newCoordSystemSelected(this.currentCoordinateSystem);
        this.setExample();
    },
    beforeUpdate () {
        this.resetValues();
        this.resetErrorMessages();
    },
    methods: {
        ...mapMutations("Tools/SearchByCoord", Object.keys(mutations)),
        ...mapActions("Tools/SearchByCoord", [
            "newCoordSystemSelected",
            "setMarker",
            "removeMarker",
            "setCenter",
            "setZoom",
            "setExample",
            "validateInput",
            "transformCoordinates",
            "resetValues",
            "resetErrorMessages"
        ]),
        /**
         * Closes this tool window by setting active to false and removes the marker if it was placed.
         * @returns {void}
         */
        close () {
            this.setActive(false);
            this.removeMarker();

            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SearchByCoord.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Called if selection of coordinate system changed.
         * @returns {void}
         */
        selectionChanged () {
            this.newCoordSystemSelected(this.currentCoordinateSystem);
            this.setExample();
            this.removeMarker();
            this.resetValues();
            this.resetErrorMessages();
        },
        /**
         * Returns the label name depending on the selected coordinate system.
         * @param {String} key in the language files
         * @returns {String} the name of the label
         */
        label (key) {
            const type = this.currentCoordinateSystem === "ETRS89" ? "cartesian" : "hdms";


            return "modules.tools.searchByCoord." + type + "." + key;
        },
        /**
         * Sets coordinates name for error messages and calls the validation function.
         * When valid coordinates were entered the transformCoordinates function gets called.
         * @param {String} coordinatesEasting the coordinates user entered
         * @param {String} coordinatesNorthing the coordinates user entered
         * @returns {void}
         */
        searchCoordinate (coordinatesEasting, coordinatesNorthing) {
            const coords = [coordinatesEasting, coordinatesNorthing];

            this.coordinatesEasting.name = i18next.t(this.label("eastingLabel"));
            this.coordinatesNorthing.name = i18next.t(this.label("northingLabel"));
            this.validateInput(coords);
            this.transformCoordinates();
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="name"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="search-by-coord"
            >
                <form
                    class="form-horizontal"
                    role="form"
                >
                    <div class="form-group form-group-sm">
                        <label
                            class="col-md-5 col-sm-5 control-label"
                        >{{ $t("modules.tools.searchByCoord.coordinateSystem") }}</label>
                        <div class="col-md-7 col-sm-7">
                            <select
                                id="coordSystemField"
                                v-model="currentCoordinateSystem"
                                class="font-arial form-control input-sm pull-left"
                                @change="selectionChanged($event)"
                            >
                                <option
                                    v-for="(coordinateSystem) in coordinateSystems"
                                    :key="coordinateSystem"
                                >
                                    {{ coordinateSystem }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <label
                            id="coordinatesEastingLabel"
                            for="coordinatesEastingField"
                            class="col-md-5 col-sm-5 control-label"
                        >{{ $t(label("eastingLabel")) }}</label>
                        <div class="col-md-7 col-sm-7">
                            <input
                                id="coordinatesEastingField"
                                v-model="coordinatesEasting.value"
                                :class="{ inputError: coordinatesEasting.errorMessage.length }"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesEastingExample"
                            ><p
                                v-if="coordinatesEasting.errorMessage.length"
                                class="error-text"
                            >
                                {{ coordinatesEasting.errorMessage }}
                            </p>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <label
                            id="coordinatesNorthingLabel"
                            for="coordinatesNorthingField"
                            class="col-md-5 col-sm-5 control-label"
                        >{{ $t(label("northingLabel")) }}</label>
                        <div class="col-md-7 col-sm-7">
                            <input
                                id="coordinatesNorthingField"
                                v-model="coordinatesNorthing.value"
                                :class="{ inputError: coordinatesNorthing.errorMessage.length }"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesNorthingExample"
                            ><p
                                v-if="coordinatesNorthing.errorMessage.length"
                                class="error-text"
                            >
                                {{ coordinatesNorthing.errorMessage }}
                            </p>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                            <button
                                class="btn btn-block"
                                @click="searchCoordinate(coordinatesEasting, coordinatesNorthing)"
                            >
                                {{ $t("common:modules.tools.searchByCoord.search") }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </template>
    </Tool>
</template>

// <style lang="less" scoped>
    @import "~variables";
.error-text {
    font-size: 85%;
    color: #a94442;
}
.inputError {
    border: 1px solid #a94442;
}
</style>
