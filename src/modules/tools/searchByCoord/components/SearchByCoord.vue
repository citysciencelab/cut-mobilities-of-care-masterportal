<script>
import Tool from "../../Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSearchByCoord";
import actions from "../store/actionsSearchByCoord";
import mutations from "../store/mutationsSearchByCoord";

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
        ...mapGetters("Tools/SearchByCoord", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
        this.setCoordinateSystem(this.currentCoordinateSystem);
        this.setExample();
    },
    methods: {
        ...mapMutations("Tools/SearchByCoord", Object.keys(mutations)),
        ...mapActions("Tools/SearchByCoord", Object.keys(actions)),
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
            this.setCoordinateSystem(this.currentCoordinateSystem);
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

            this.resetErrorMessages();
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
                                :class="{ inputError: getEastingError }"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesEastingExample"
                            ><p
                                v-if="eastingNoCoord"
                                class="error-text"
                            >
                                {{ currentSelection === "ETRS89" ? $t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: $t(label("eastingLabel"))}) : $t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: $t(label("eastingLabel"))}) }}
                            </p>
                            <p
                                v-if="eastingNoMatch"
                                class="error-text"
                            >
                                {{ (currentSelection === "ETRS89" ? $t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: $t(label("eastingLabel"))}) : $t("common:modules.tools.searchByCoord.errorMsg.hdmsNoMatch", {valueKey: $t(label("eastingLabel"))})) + coordinatesEastingExample }}
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
                                :class="{ inputError: getNorthingError }"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesNorthingExample"
                            ><p
                                v-if="northingNoCoord"
                                class="error-text"
                            >
                                {{ currentSelection === "ETRS89" ? $t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: $t(label("northingLabel"))}) : $t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: $t(label("northingLabel"))}) }}
                            </p>
                            <p
                                v-if="northingNoMatch"
                                class="error-text"
                            >
                                {{ (currentSelection === "ETRS89" ? $t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: $t(label("northingLabel"))}) : $t("common:modules.tools.searchByCoord.errorMsg.hdmsNoMatch", {valueKey: $t(label("northingLabel"))})) + coordinatesNorthingExample }}
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

<style lang="less" scoped>
    @import "~variables";
.error-text {
    font-size: 85%;
    color: #a94442;
}
.inputError {
    border: 1px solid #a94442;
}
</style>
