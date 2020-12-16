<script>
import Tool from "../../Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import {getProjections} from "masterportalAPI/src/crs";
import getters from "../store/gettersSearchByCoord";
import mutations from "../store/mutationsSearchByCoord";

export default {
    name: "SearchByCoord",
    components: {
        Tool
    },
    data: function () {
        return {
            mapElement: document.getElementById("map"),
            coordinatesEasting: {name: "", value: "", errorMessage: "", example: this.currentProjectionName === "EPSG:4326" ? "53° 33' 25" : "564459.13"},
            coordinatesNorthing: {name: "", value: "", errorMessage: "", example: this.currentProjectionName === "EPSG:4326" ? "9° 59' 50" : "5935103.67"}
        };
    },
    computed: {
        ...mapGetters("Tools/SearchByCoord", Object.keys(getters)),
        ...mapGetters("Map", ["projection", "mouseCoord"]),
        /**
         * Must be a two-way computed property, because it is used as v-model for select-Element, see https://vuex.vuejs.org/guide/forms.html.
         */
        currentSelection: {
            get () {
                return this.$store.state.Tools.SearchByCoord.currentSelection;
            },
            set (newValue) {
                this.setCurrentSelection(newValue);
            }
        }
    },
    created () {
        this.$on("close", this.close);
        this.createInteraction();
    },
    beforeUpdate () {
        this.coordinatesEasting.errorMessage = "";
        this.coordinatesEasting.value = "";
        this.coordinatesNorthing.errorMessage = "";
        this.coordinatesNorthing.value = "";
    },
    methods: {
        ...mapMutations("Tools/SearchByCoord", Object.keys(mutations)),
        ...mapActions("Tools/SearchByCoord", [
            "newProjectionSelected",
            "setMarker",
            "setCenter"
        ]),

        close () {
            this.setActive(false);

            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SearchByCoord.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Called if selection of projection changed. Sets the current scprojectionale to state and changes the position.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            this.setCurrentSelection(event.target.value);
            this.newProjectionSelected();
            this.coordinatesEasting.example = this.currentProjectionName === "EPSG:4326" ? "53° 33' 25" : "564459.13";
            this.coordinatesNorthing.example = this.currentProjectionName === "EPSG:4326" ? "9° 59' 50" : "5935103.67";
            this.coordinatesEasting.errorMessage = "";
            this.coordinatesEasting.value = "";
            this.coordinatesNorthing.errorMessage = "";
            this.coordinatesNorthing.value = "";
            this.searchCoordinate(this.coordinatesEasting, this.coordinatesNorthing);
        },
        /**
         * Returns the label mame depending on the selected projection.
         * @param {String} key in the language files
         * @returns {String} the name of the label
         */
        label (key) {
            const type = this.currentProjectionName === "EPSG:4326" ? "hdms" : "cartesian";


            return "modules.tools.searchByCoord." + type + "." + key;
        },
        /**
         * Stores the projections and adds interaction pointermove to map.
         * @returns {void}
         */
        createInteraction () {
            const pr = getProjections();

            this.setProjections(pr);

        },
        validateInput (coordinatesEasting, coordinatesNorthing) {
            const validETRS89 = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
                validWGS84 = /^\d[0-9]{0,2}[°]{0,1}\s*[0-9]{0,2}['`´]{0,1}\s*[0-9]{0,2}['`´]{0,2}["]{0,2}\s*$/,
                coordinates = [coordinatesEasting, coordinatesNorthing],
                selectedCoordinates = [];

            if (this.currentProjection.title === "ETRS89/UTM 32N") {

                for (const coord of coordinates) {

                    if (coord.value === "" || coord.value.length < 1) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: coord.name});
                    }
                    else if (!coord.value.match(validETRS89)) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name, valueExample: coord.example});
                    }
                    else {
                        coordinatesEasting.errorMessage = "";
                        coordinatesNorthing.errorMessage = "";
                        selectedCoordinates.push(coord.value);
                    }
                }
            }
            if (this.currentProjection.title === "WGS 84 (long/lat)") {
                for (const coord of coordinates) {

                    if (coord.value === "" || coord.value.length < 1) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: coord.name});
                    }
                    else if (!coord.value.match(validWGS84)) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name, valueExample: coord.example});
                    }
                    else {
                        coordinatesEasting.errorMessage = "";
                        coordinatesNorthing.errorMessage = "";
                        selectedCoordinates.push(coord.value);
                    }
                }
            }
            if (this.currentProjection.title === "Bessel/Gauß-Krüger 3") {
                for (const coord of coordinates) {

                    if (coord.value === "" || coord.value.length < 1) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: coord.name});
                    }
                    else if (!coord.value.match(validETRS89)) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name, valueExample: coord.example});
                    }
                    else {
                        coordinatesEasting.errorMessage = "";
                        coordinatesNorthing.errorMessage = "";
                        selectedCoordinates.push(coord.value);
                    }
                }
            }
            if (this.currentProjection.title === "ETRS89/Gauß-Krüger 3") {
                for (const coord of coordinates) {

                    if (coord.value === "" || coord.value.length < 1) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: coord.name});
                    }
                    else if (!coord.value.match(validETRS89)) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name, valueExample: coord.example});
                    }
                    else {
                        coordinatesEasting.errorMessage = "";
                        coordinatesNorthing.errorMessage = "";
                        selectedCoordinates.push(coord.value);
                    }
                }
            }
            if (selectedCoordinates.length === 2) {
                this.setMarker(selectedCoordinates);
                Radio.trigger("MapView", "setCenter", selectedCoordinates);
                // this.setCenter(selectedCoordinates, "0");
            }
        },
        searchCoordinate (coordinatesEasting, coordinatesNorthing) {
            this.coordinatesEasting.name = i18next.t(this.label("eastingLabel"));
            this.coordinatesNorthing.name = i18next.t(this.label("northingLabel"));
            this.validateInput(coordinatesEasting, coordinatesNorthing);
        }
    }};
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
                                v-model="currentSelection"
                                class="font-arial form-control input-sm pull-left"
                                @change="selectionChanged($event)"
                            >
                                <option
                                    v-for="(projection, i) in projections"
                                    :key="i"
                                    :value="projection.name"
                                >
                                    {{ projection.title ? projection.title : projection.name }}
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
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesEasting.example"
                            >
                        </div>
                        <p v-if="coordinatesEasting.errorMessage.length">
                            {{ coordinatesEasting.errorMessage }}
                        </p>
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
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesNorthing.example"
                            >
                        </div>
                        <p v-if="coordinatesNorthing.errorMessage.length">
                            {{ coordinatesNorthing.errorMessage }}
                        </p>
                    </div>
                    <div class="form-group form-group-sm">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                            <button
                                class="btn btn-md btn-block"
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

</style>
