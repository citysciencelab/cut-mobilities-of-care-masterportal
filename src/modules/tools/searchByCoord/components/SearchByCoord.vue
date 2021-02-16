<script>
import Tool from "../../Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSearchByCoord";
import actions from "../store/actionsSearchByCoord";
import mutations from "../store/mutationsSearchByCoord";
import state from "../store/stateSearchByCoord";

export default {
    name: "SearchByCoord",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/SearchByCoord", Object.keys(getters)),
        eastingNoCoordMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: this.$t(this.getLabel("eastingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: this.$t(this.getLabel("eastingLabel"))});
        },
        northingNoCoordMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: this.$t(this.getLabel("northingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: this.$t(this.getLabel("northingLabel"))});
        },
        northingNoMatchMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: this.$t(this.getLabel("northingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoMatch", {valueKey: this.$t(this.getLabel("northingLabel"))});
        },
        eastingNoMatchMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: this.$t(this.getLabel("eastingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoMatch", {valueKey: this.$t(this.getLabel("eastingLabel"))});
        }
    },
    created () {
        this.$on("close", this.close);
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
                                class="font-arial form-control input-sm pull-left"
                                :value="currentSelection"
                                @change="selectionChanged"
                            >
                                <option
                                    v-for="coordinateSystem in coordinateSystems"
                                    :key="coordinateSystem"
                                    :value="coordinateSystem"
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
                        >{{ $t(getLabel("eastingLabel")) }}</label>
                        <div class="col-md-7 col-sm-7">
                            <input
                                id="coordinatesEastingField"
                                v-model="coordinatesEasting.value"
                                :class="{ inputError: getEastingError }"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesEastingExample"
                                @input="validateInput(coordinatesEasting)"
                            ><p
                                v-if="eastingNoCoord"
                                class="error-text"
                            >
                                {{ eastingNoCoordMessage }}
                            </p>
                            <p
                                v-if="eastingNoMatch"
                                class="error-text"
                            >
                                {{ eastingNoMatchMessage + coordinatesEastingExample }}
                            </p>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <label
                            id="coordinatesNorthingLabel"
                            for="coordinatesNorthingField"
                            class="col-md-5 col-sm-5 control-label"
                        >{{ $t(getLabel("northingLabel")) }}</label>
                        <div class="col-md-7 col-sm-7">
                            <input
                                id="coordinatesNorthingField"
                                v-model="coordinatesNorthing.value"
                                :class="{ inputError: getNorthingError }"
                                type="text"
                                class="form-control"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesNorthingExample"
                                @input="validateInput(coordinatesNorthing)"
                            ><p
                                v-if="northingNoCoord"
                                class="error-text"
                            >
                                {{ northingNoCoordMessage }}
                            </p>
                            <p
                                v-if="northingNoMatch"
                                class="error-text"
                            >
                                {{ northingNoMatchMessage + coordinatesNorthingExample }}
                            </p>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                            <button
                                class="btn btn-block"
                                :disabled="getEastingError || getNorthingError || !coordinatesEasting.value || !coordinatesNorthing.value"
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
