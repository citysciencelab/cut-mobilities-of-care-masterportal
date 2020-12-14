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
            coordinatesEasting: "",
            coordinatesNorthing: "",
            errors: []
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
    methods: {
        ...mapMutations("Tools/SearchByCoord", Object.keys(mutations)),
        ...mapActions("Tools/SearchByCoord", [
            "newProjectionSelected"
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
         * Returns the label mame depending on the selected projection.
         * @param {String} key in the language files
         * @returns {String} the name of the label
         */
        errorMessage (key) {

            return i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: key});
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
                validWGS84_dez = /[0-9]{1,3}[.,]{0,1}[0-9]{0,5}[\s]{0,1}[°]{0,1}\s*$/,
                coordinates = [coordinatesEasting, coordinatesNorthing];

            if (this.currentProjection.title === "ETRS89/UTM 32N") {
                console.log("gets executed");
                for (const coord of coordinates) {

                    if (coord === undefined || coord.length < 1) {
                        this.errors.push(coord);
                        console.log("Leere Eingabe " + this.errors);
                        // value.ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: value.key});

                        // $(fieldName).after("<span class='text-danger'><small>" + value.ErrorMsg + "</small></span>");
                        // $(fieldName).parent().addClass("has-error");
                    }
                    else if (!coord.match(validETRS89)) {
                        this.errors.push(coord);
                        console.log(this.errors);
                        // value.ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: value.key, valueExample: value.example});

                        // $(fieldName).after("<span class='text-danger'><small>" + value.ErrorMsg + "</small></span>");
                        // $(fieldName).parent().addClass("has-error");
                    }
                    else {
                        // $(fieldName).parent().removeClass("has-error");
                        // Radio.trigger("Alert", "alert:remove");
                    }
                }
            }
        },
        searchCoordinate (coordinatesEasting, coordinatesNorthing) {
            this.errors = [];
            this.validateInput(coordinatesEasting, coordinatesNorthing);
            console.log("searching coordinate");
            console.log(coordinatesEasting);
            console.log(coordinatesNorthing);
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
                                v-model="coordinatesEasting"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + ' 564459.13'"
                            >
                        </div>
                        <p v-if="errors.length">
                            Fehler
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
                                v-model="coordinatesNorthing"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + ' 5935103.67'"
                            >
                        </div>
                        <p v-if="errors.length">
                            Fehler
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
