<script>
import Tool from "./Tool.vue";
import {Pointer} from "ol/interaction.js";
import {toStringHDMS, toStringXY} from "ol/coordinate.js";
import {getProjections, transformFromMapProjection} from "masterportalAPI/src/crs";

export default {
    name: "SupplyCoord",
    components: {
        Tool
    },
    data () {
        return {
            coordinatesEastingField: "",
            coordinatesNorthingField: "",
            coordinatesEastingLabel: "Rechtswert",
            coordinatesNorthingLabel: "Hochwert"
        };
    },
    computed: {
        active () {
            return this.$store.state.Tools.SupplyCoord.active;
        },
        updatePosition () {
            return this.$store.state.Tools.SupplyCoord.updatePosition;
        },
        projections () {
            return this.$store.state.Tools.SupplyCoord.projections;
        },
        renderToWindow () {
            return this.$store.state.Tools.SupplyCoord.renderToWindow;
        },
        icon () {
            return this.$store.state.Tools.SupplyCoord.glyphicon;
        },
        title () {
            return this.$store.state.Tools.SupplyCoord.title;
        },
        currentProjectionName () {
            return this.$store.state.Tools.SupplyCoord.currentProjectionName;
        },
        currentSelection: {
            get () {
                return this.$store.state.Tools.SupplyCoord.currentSelection;
            },
            set (newValue) {
                this.$store.commit("Tools/SupplyCoord/currentSelection", newValue);
            }
        }
    },
    watch: {
        active (newValue) {
            const myBus = Backbone.Events;

            Radio.trigger("MapMarker", "hideMarker");
            Radio.trigger("Map", "registerListener", "pointermove", this.setCoordinates.bind(this), this);
            if (newValue) {
                // active is true
                myBus.listenTo(Radio.channel("Map"), {
                    clickedWindowPosition: function (evt) {
                        this.positionClicked(evt.coordinate);
                    }
                });
                this.createInteraction();
                this.changedPosition();
            }
            else {
                this.$store.commit("Tools/SupplyCoord/updatePosition", true);
                this.removeInteraction();
                myBus.stopListening(Radio.channel("Map", "clickedWindowPosition"));
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        selectionChanged (event) {
            this.$store.commit("Tools/SupplyCoord/currentSelection", event.target.value);
            this.changedPosition(event.target.value);
        },
        positionClicked: function (position) {
            const isViewMobile = Radio.request("Util", "isViewMobile"),
                updatePosition = isViewMobile
                    ? true
                    : this.$store.state.Tools.SupplyCoord.updatePosition;

            this.$store.commit("Tools/SupplyCoord/positionMapProjection", position);
            this.changedPosition(position);
            this.$store.commit("Tools/SupplyCoord/updatePosition", !updatePosition);
            Radio.trigger("MapMarker", "showMarker", position);
        },
        setCoordinates: function (evt) {
            const position = evt.coordinate;

            if (this.$store.state.Tools.SupplyCoord.updatePosition) {
                this.$store.commit("Tools/SupplyCoord/positionMapProjection", position);
                this.changedPosition(position);
            }
        },
        createInteraction () {
            this.$store.commit("Tools/SupplyCoord/projections", getProjections());
            this.$store.commit("Tools/SupplyCoord/mapProjection", Radio.request("MapView", "getProjection"));
            const pointerMove = new Pointer(
                {
                    handleMoveEvent: function (evt) {
                        this.checkPosition(evt.coordinate);
                    }.bind(this),
                    handleDownEvent: function (evt) {
                        this.positionClicked(evt.coordinate);
                    }.bind(this)
                },
                this
            );

            this.$store.commit("Tools/SupplyCoord/selectPointerMove", pointerMove);
            Radio.trigger("Map", "addInteraction", pointerMove);
        },
        removeInteraction () {
            Radio.trigger("Map", "removeInteraction", this.$store.state.Tools.SupplyCoord.selectPointerMove);
            this.$store.commit("Tools/SupplyCoord/selectPointerMove", null);
        },
        checkPosition (position) {
            if (this.$store.state.Tools.SupplyCoord.updatePosition) {
                Radio.trigger("MapMarker", "showMarker", position);
                this.$store.commit("Tools/SupplyCoord/positionMapProjection", position);
            }
        },
        changedPosition () {
            const targetProjectionName = this.$store.state.Tools.SupplyCoord.currentSelection,
                position = this.returnTransformedPosition(targetProjectionName),
                targetProjection = this.returnProjectionByName(targetProjectionName);

            this.$store.commit("Tools/SupplyCoord/currentProjectionName", targetProjectionName);
            if (position) {
                this.adjustPosition(position, targetProjection);
                this.adjustWindow(targetProjection);
            }
        },
        returnTransformedPosition (targetProjection) {
            const positionMapProjection = this.$store.state.Tools.SupplyCoord
                .positionMapProjection;
            let positionTargetProjection = [0, 0];

            if (positionMapProjection.length > 0) {
                positionTargetProjection = transformFromMapProjection(
                    Radio.request("Map", "getMap"),
                    targetProjection,
                    positionMapProjection
                );
            }
            return positionTargetProjection;
        },
        returnProjectionByName (name) {
            const projections = this.$store.state.Tools.SupplyCoord.projections;

            return _.find(projections, function (projection) {
                return projection.name === name;
            });
        },
        adjustPosition (position, targetProjection) {
            let coord, easting, northing;

            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                coord = this.getHDMS(position);
                easting = coord.substr(0, 13);
                northing = coord.substr(14);
            }
            // kartesische Koordinaten
            else {
                coord = this.getCartesian(position);
                easting = coord.split(",")[0].trim();
                northing = coord.split(",")[1].trim();
            }
            this.coordinatesEastingField = easting;
            this.coordinatesNorthingField = northing;
        },
        adjustWindow (targetProjection) {
            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                this.coordinatesEastingLabel = "Breite";
                this.coordinatesNorthingLabel = "Länge";
            }
            // kartesische Koordinaten
            else {
                this.coordinatesEastingLabel = "Rechtswert";
                this.coordinatesNorthingLabel = "Hochwert";
            }
        },
        getHDMS (coord) {
            return toStringHDMS(coord);
        },
        getCartesian (coord) {
            return toStringXY(coord, 2);
        },
        close () {
            this.$store.commit("Tools/SupplyCoord/active", false);
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SupplyCoord.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="title"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
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
                    >Koordinatensystem</label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="coordSystemField"
                            v-model="currentSelection"
                            class="form-control input-sm pull-left"
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
                    >{{ coordinatesEastingLabel }}</label>
                    <div class="col-md-7 col-sm-7">
                        <input
                            id="coordinatesEastingField"
                            v-model="coordinatesEastingField"
                            type="text"
                            class="form-control"
                            readonly
                            contenteditable="false"
                        >
                    </div>
                </div>
                <div class="form-group form-group-sm">
                    <label
                        id="coordinatesNorthingLabel"
                        for="coordinatesNorthingField"
                        class="col-md-5 col-sm-5 control-label"
                    >{{ coordinatesNorthingLabel }}</label>
                    <div class="col-md-7 col-sm-7">
                        <input
                            id="coordinatesNorthingField"
                            v-model="coordinatesNorthingField"
                            type="text"
                            class="form-control"
                            readonly
                            contenteditable="false"
                        >
                    </div>
                </div>
            </form>
        </template>
    </Tool>
</template>
