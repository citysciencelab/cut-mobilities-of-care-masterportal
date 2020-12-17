<script>
import Tool from "../../Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSearchByCoord";
import mutations from "../store/mutationsSearchByCoord";
import proj4 from "proj4";

export default {
    name: "SearchByCoord",
    components: {
        Tool
    },
    data: function () {
        return {
            mapElement: document.getElementById("map"),
            coordinateSystems: ["ETRS89", "WGS84", "WGS84(Dezimalgrad)"],
            currentCoordinateSystem: "ETRS89",
            coordinatesEasting: {name: "", value: "", errorMessage: "", example: ""},
            coordinatesNorthing: {name: "", value: "", errorMessage: "", example: ""}
        };
    },
    computed: {
        ...mapGetters("Tools/SearchByCoord", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
        this.setExample();
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
            "removeMarker",
            "setCenter"
        ]),

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
         * Called if selection of projection changed. Sets the current scprojectionale to state and changes the position.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged () {
            this.setExample();
            this.removeMarker();
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
            const type = this.currentCoordinateSystem === "ETRS89" ? "cartesian" : "hdms";


            return "modules.tools.searchByCoord." + type + "." + key;
        },
        validateInput (coordinatesEasting, coordinatesNorthing) {
            const validETRS89 = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
                validWGS84 = /^\d[0-9]{0,2}[°]{0,1}\s*[0-9]{0,2}['`´′]{0,1}\s*[0-9]{0,2}['`´′]{0,2}["]{0,2}\s*$/,
                validWGS84_dez = /[0-9]{1,3}[.,]{0,1}[0-9]{0,5}[\s]{0,1}[°]{0,1}\s*$/,
                coordinates = [coordinatesEasting, coordinatesNorthing],
                selectedCoordinates = [];

            if (this.currentCoordinateSystem === "ETRS89") {

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
            if (this.currentCoordinateSystem === "WGS84") {
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
                        selectedCoordinates.push(coord.value.split(/[\s°′″'"´`]+/));
                    }
                }
            }
            if (this.currentCoordinateSystem === "WGS84(Dezimalgrad)") {
                for (const coord of coordinates) {

                    if (coord.value === "" || coord.value.length < 1) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: coord.name});
                    }
                    else if (!coord.value.match(validWGS84_dez)) {
                        coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name, valueExample: coord.example});
                    }
                    else {
                        coordinatesEasting.errorMessage = "";
                        coordinatesNorthing.errorMessage = "";
                        selectedCoordinates.push(coord.value.split(/[\s°]+/));
                    }
                }
            }
            if (selectedCoordinates.length === 2) {

                if (this.currentCoordinateSystem !== "ETRS89") {
                    const easting = Number(selectedCoordinates[0][0]) +
                (Number(selectedCoordinates[0][1] ? selectedCoordinates[0][1] : 0) / 60) +
                (Number(selectedCoordinates[0][2] ? selectedCoordinates[0][2] : 0) / 60 / 60),
                        northing = Number(selectedCoordinates[1][0]) +
                (Number(selectedCoordinates[1][1] ? selectedCoordinates[1][1] : 0) / 60) +
                (Number(selectedCoordinates[1][2] ? selectedCoordinates[1][2] : 0) / 60 / 60),
                        transformedCoordinates = proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [northing, easting]); // turning the coordinates around to make it work for WGS84

                    this.setMarker(transformedCoordinates);
                    this.setCenter(transformedCoordinates);
                }
                else {
                    this.setMarker(selectedCoordinates);
                    this.setCenter(selectedCoordinates);
                }
            }
        },
        searchCoordinate (coordinatesEasting, coordinatesNorthing) {
            this.coordinatesEasting.name = i18next.t(this.label("eastingLabel"));
            this.coordinatesNorthing.name = i18next.t(this.label("northingLabel"));
            this.validateInput(coordinatesEasting, coordinatesNorthing);
        },
        setExample () {
            if (this.currentCoordinateSystem === "ETRS89") {
                this.coordinatesEasting.example = "564459.13";
                this.coordinatesNorthing.example = "5935103.67";
            }
            else if (this.currentCoordinateSystem === "WGS84") {
                this.coordinatesEasting.example = "53° 33′ 25″";
                this.coordinatesNorthing.example = "9° 59′ 50″";
            }
            else {
                this.coordinatesEasting.example = "53.55555°";
                this.coordinatesNorthing.example = "10.01234°";
            }
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
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesEasting.example"
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
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesNorthing.example"
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
