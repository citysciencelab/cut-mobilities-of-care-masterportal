<script>
import Tool from "../../Tool.vue";
import {Pointer} from "ol/interaction.js";
import {toStringHDMS, toStringXY} from "ol/coordinate.js";
import {getProjections, transformFromMapProjection} from "masterportalAPI/src/crs";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSupplyCoord";
import mutations from "../store/mutationsSupplyCoord";
import isMobile from "../../../../utils/isMobile";

export default {
    name: "SupplyCoord",
    components: {
        Tool
    },
    data () {
        return {
            coordinatesEastingField: "",
            coordinatesNorthingField: ""
        };
    },
    computed: {
        ...mapGetters("Tools/SupplyCoord", Object.keys(getters)),
        ...mapGetters("Map", ["map", "projection"]),
        /**
         * Must be a two-way computed property, because it is used as v-model for select-Element, see https://vuex.vuejs.org/guide/forms.html.
         */
        currentSelection: {
            get () {
                return this.$store.state.Tools.SupplyCoord.currentSelection;
            },
            set (newValue) {
                this.setCurrentSelection(newValue);
            }
        }
    },
    watch: {
        active (newValue) {
            if (newValue) {
                // active is true
                this.addPointerMoveHandlerToMap(this.setCoordinates);
                this.createInteraction();
                this.changedPosition();
            }
            else {
                this.removePointerMoveHandlerFromMap(this.setCoordinates);
                this.setUpdatePosition(true);
                this.removeInteraction();
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.initialize();
        if (this.isActive) {
            this.setActive(true);
        }
        this.activateByUrlParam();
    },
    methods: {
        ...mapActions("Tools/SupplyCoord", [
            "activateByUrlParam",
            "initialize"
        ]),
        ...mapMutations("Tools/SupplyCoord", Object.keys(mutations)),
        ...mapActions("Map", {
            addPointerMoveHandlerToMap: "addPointerMoveHandler",
            removePointerMoveHandlerFromMap: "removePointerMoveHandler",
            addInteractionToMap: "addInteraction",
            removeInteractionFromMap: "removeInteraction"}),
        /*
        * Function to initiate the copying of the coordinates from the inputfields.
        * @fires Util#RadioTriggerUtilCopyToClipboard
        * @param {event} evt Click Event
        * @returns {void}
        */
        copyToClipboard ({target}) {
            target.select();
            // seems to be required for mobile devices
            target.setSelectionRange(0, 99999);
            document.execCommand("copy");
        },
        /**
         * Called if selection of scale changed. Sets the current scale to state and changes the position.
         * @param {object} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            this.setCurrentSelection(event.target.value);
            this.changedPosition(event.target.value);
        },
        /**
         * Remembers the projection and shows mapmarker at the given position.
         * @param {object} event - pointerdown-event, to get the position from
         * @fires MapMarker#RadioTriggerMapMarkerShowMarker
         * @returns {void}
         */
        positionClicked: function (event) {
            const updatePosition = isMobile() ? true : this.updatePosition,
                position = event.coordinate;

            this.setPositionMapProjection(position);
            this.changedPosition(position);
            this.setUpdatePosition(!updatePosition);

            // TODO replace trigger when MapMarker is migrated
            Radio.trigger("MapMarker", "showMarker", position);
        },
        /**
         * Sets the coordinates from the maps pointermove-event.
         * @param {object} event pointermove-event, to get the position from
         * @returns {void}
         */
        setCoordinates: function (event) {
            const position = event.coordinate;

            if (this.updatePosition) {
                this.setPositionMapProjection(position);
                this.changedPosition(position);
            }
        },
        /**
         * Stores the projections and adds interaction pointermove to map.
         * @returns {void}
         */
        createInteraction () {
            const pr = getProjections();

            // EPSG:25832 must be the first one
            pr.sort(function(a, b){
                if(a.name.indexOf("25832") > -1) {
                     return -1; 
                }
                return 0;
            })
            this.setProjections(pr);

            this.setMapProjection(this.projection);
            const pointerMove = new Pointer(
                {
                    handleMoveEvent: function (evt) {
                        this.checkPosition(evt.coordinate);
                    }.bind(this),
                    handleDownEvent: function (evt) {
                        this.positionClicked(evt);
                    }.bind(this)
                },
                this
            );

            this.setSelectPointerMove(pointerMove);
            this.addInteractionToMap(pointerMove);
        },
        /**
         * Removes the interaction from map.
         * @returns {void}
         */
        removeInteraction () {
            this.removeInteractionFromMap(this.selectPointerMove);
            this.setSelectPointerMove(null);
        },
        /**
         * Checks the position for update and shows the marker at updated position
         * @param {Array} position contains coordinates of mouse position
         * @returns {void}
         */
        checkPosition (position) {
            if (this.updatePosition) {
                // TODO replace trigger when MapMarker is migrated
                Radio.trigger("MapMarker", "showMarker", position);
                this.setPositionMapProjection(position);
            }
        },
        /*
        * Delegates the calculation and transformation of the position according to the projection
        * @returns {void}
        */
        changedPosition () {
            const targetProjectionName = this.currentSelection,
                position = this.getTransformedPosition(targetProjectionName),
                targetProjection = this.getProjectionByName(targetProjectionName);

            this.setCurrentProjectionName(targetProjectionName);
            if (position) {
                this.adjustPosition(position, targetProjection);
            }
        },
        /**
         * Transforms the projection.
         * @param {object} targetProjection the target projection
         * @returns {object} the transformed projection
         */
        getTransformedPosition (targetProjection) {
            let positionTargetProjection = [0, 0];

            if (this.positionMapProjection.length > 0) {
                positionTargetProjection = transformFromMapProjection(
                    this.map,
                    targetProjection,
                    this.positionMapProjection
                );
            }
            return positionTargetProjection;
        },
        /**
         * Returns the projection to the given name.
         * @param {string} name of the projection
         * @returns {object} projection
         */
        getProjectionByName (name) {
            const projections = this.projections;

            return projections.find(projection => {
                return projection.name === name;
            });
        },
        /*
        * Calculates the clicked position and writes the coordinate-values into the textfields.
        * @param {object} position transformed coordinates
        * @param {object} targetProjection selected projection
        * @returns {void}
        */
        adjustPosition (position, targetProjection) {
            let coord, easting, northing;

            // geographical coordinates
            if (targetProjection.projName === "longlat") {
                coord = toStringHDMS(position);
                easting = coord.substr(0, 13);
                northing = coord.substr(14);
            }
            // cartesian coordinates
            else {
                coord = toStringXY(position, 2);
                easting = coord.split(",")[0].trim();
                northing = coord.split(",")[1].trim();
            }
            this.coordinatesEastingField = easting;
            this.coordinatesNorthingField = northing;
        },
        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);
        },
        /**
         * Returns the label mame depending on the selected projection.
         * @param {string} key in the language files
         * @returns {string} the name of the label
         */
        label (key) {
            const type = this.currentProjectionName === "EPSG:4326" ? "hdms" : "cartesian";

            return "modules.tools.supplyCoord." + type + "." + key;
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
            <form
                v-if="active"
                class="form-horizontal"
                role="form"
            >
                <div class="form-group form-group-sm">
                    <label
                        for="coordSystemField"
                        class="col-md-5 col-sm-5 control-label"
                    >{{ $t("modules.tools.supplyCoord.coordSystemField") }}</label>
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
                                :SELECTED="projection.name === currentProjectionName"
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
                            v-model="coordinatesEastingField"
                            type="text"
                            class="form-control"
                            readonly
                            contenteditable="false"
                            @click="copyToClipboard"
                        >
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
                            v-model="coordinatesNorthingField"
                            type="text"
                            class="form-control"
                            readonly
                            contenteditable="false"
                            @click="copyToClipboard"
                        >
                    </div>
                </div>
            </form>
        </template>
    </Tool>
</template>
