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
            storePath: this.$store.state.Tools.SupplyCoord,
            localePath: "modules.tools.getCoord"
        };
    },
    computed: {
        active: {
            get () {
                return this.storePath.active;
            },
            set (val) {
                this.$store.commit("Tools/SupplyCoord/active", val);
            }
        },
        currentProjectionName: {
            get () {
                return this.storePath.currentProjectionName;
            },
            set (val) {
                this.$store.commit("Tools/SupplyCoord/currentProjectionName", val);
            }
        },
        currentSelection: {
            get () {
                return this.storePath.currentSelection;
            },
            set (newValue) {
                this.$store.commit("Tools/SupplyCoord/currentSelection", newValue);
            }
        },
        icon () {
            return this.storePath.glyphicon;
        },
        projections: {
            get () {
                return this.storePath.projections;
            },
            set (val) {
                this.$store.commit("Tools/SupplyCoord/projections", val);
            }
        },
        positionMapProjection: {
            get () {
                return this.storePath.positionMapProjection;
            }, set (val) {
                this.$store.commit("Tools/SupplyCoord/positionMapProjection", val);
            }
        },
        renderToWindow () {
            return this.storePath.renderToWindow;
        },
        selectPointerMove: {
            get () {
                return this.storePath.selectPointerMove;
            },
            set (val) {
                this.$store.commit("Tools/SupplyCoord/selectPointerMove", val);
            }
        },
        updatePosition: {
            get () {
                return this.storePath.updatePosition;
            },
            set (val) {
                this.$store.commit("Tools/SupplyCoord/updatePosition", val);
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
                this.updatePosition = true;
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
            this.currentSelection = event.target.value;
            this.changedPosition(event.target.value);
        },
        positionClicked: function (position) {
            const isViewMobile = Radio.request("Util", "isViewMobile"),
                updatePosition = isViewMobile ? true : this.updatePosition;

            this.positionMapProjection = position;
            this.changedPosition(position);
            this.updatePosition = !updatePosition;
            Radio.trigger("MapMarker", "showMarker", position);
        },
        setCoordinates: function (evt) {
            const position = evt.coordinate;

            if (this.updatePosition) {
                this.positionMapProjection = position;
                this.changedPosition(position);
            }
        },
        createInteraction () {
            this.projections = getProjections();
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

            this.selectPointerMove = pointerMove;
            Radio.trigger("Map", "addInteraction", pointerMove);
        },
        removeInteraction () {
            Radio.trigger("Map", "removeInteraction", this.selectPointerMove);
            this.selectPointerMove = null;
        },
        checkPosition (position) {
            if (this.updatePosition) {
                Radio.trigger("MapMarker", "showMarker", position);
                this.positionMapProjection = position;
            }
        },
        changedPosition () {
            const targetProjectionName = this.currentSelection,
                position = this.returnTransformedPosition(targetProjectionName),
                targetProjection = this.returnProjectionByName(targetProjectionName);

            this.currentProjectionName = targetProjectionName;
            if (position) {
                this.adjustPosition(position, targetProjection);
            }
        },
        returnTransformedPosition (targetProjection) {
            let positionTargetProjection = [0, 0];

            if (this.positionMapProjection.length > 0) {
                positionTargetProjection = transformFromMapProjection(
                    Radio.request("Map", "getMap"),
                    targetProjection,
                    this.positionMapProjection
                );
            }
            return positionTargetProjection;
        },
        returnProjectionByName (name) {
            const projections = this.projections;

            return _.find(projections, function (projection) {
                return projection.name === name;
            });
        },
        adjustPosition (position, targetProjection) {
            let coord, easting, northing;

            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                coord = toStringHDMS(position);
                easting = coord.substr(0, 13);
                northing = coord.substr(14);
            }
            // kartesische Koordinaten
            else {
                coord = toStringXY(position, 2);
                easting = coord.split(",")[0].trim();
                northing = coord.split(",")[1].trim();
            }
            this.coordinatesEastingField = easting;
            this.coordinatesNorthingField = northing;
        },
        close () {
            this.active = false;
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.storePath.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        label (key) {
            return [this.localePath, this.currentProjectionName === "EPSG:4326" ? "hdms" : "cartesian", key].join(".");
        }
    }
};
</script>

<template lang="html">
    <!-- TODO: Translation of the entry in the menu is not implemented yet -->
    <Tool
        :title="$t([localePath, 'title'].join('.'))"
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
                    >{{ $t([localePath, "coordSystemField"].join(".")) }}</label>
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
                    >{{ $t(label("eastingLabel")) }}</label>
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
                    >{{ $t(label("northingLabel")) }}</label>
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
