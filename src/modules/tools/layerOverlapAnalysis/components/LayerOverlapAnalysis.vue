<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature";
import {Vector as VectorLayer} from "ol/layer";
import {Fill, Stroke, Style} from "ol/style";
import Tool from "../../Tool.vue";
import getters from "../store/gettersLayerOverlapAnalysis";

import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";
import mutations from "../../layerOverlapAnalysis/store/mutationsLayerOverlapAnalysis";

/**
 * Tool to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 */
export default {
    name: "LayerOverlapAnalysis",
    components: {
        Tool
    },
    data () {
        return {
            timerId: null,
            resultLayerStyle: new Style({
                fill: new Fill({
                    color: ["105", "175", "105", "0.7"]
                }),
                stroke: new Stroke({
                    color: ["0", "135", "255", "0.7"],
                    width: 2
                })
            }),
            bufferLayerStyle: new Style({
                fill: new Fill({
                    color: ["255", "230", "65", "0.3"]
                }),
                stroke: new Stroke({
                    color: ["255", "50", "0", "0.5"],
                    width: 2
                })
            })
        };
    },
    computed: {
        ...mapGetters("Tools/LayerOverlapAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["map"]),
        targetOptions: {
            get () {
                let options = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"});

                if (this.sourceLayerSelection) {
                    options = options.filter(layer => {
                        return layer.get("id") !== this.sourceLayerSelection.get("id");
                    });
                }
                return options;
            }
        },
        sourceLayerSelection: {
            get () {
                return this.selectedSourceLayer;
            },
            set (newVal) {
                this.clearResultLayer();

                if (this.targetLayerSelection) {
                    this.targetLayerSelection.setIsSelected(false);
                    this.targetLayerSelection = null;
                }

                if (newVal) {
                    this.sourceOptions.forEach(option => {
                        option.setIsSelected(newVal.get("id") === option.get("id"));
                    });
                }

                if (this.inputRadius) {
                    this.clearBufferLayer();
                    clearTimeout(this.timerId);
                    this.timerId = setTimeout(() => {
                        this.applyBufferRadius();
                    }, 1000);
                }
                this.setSelectedSourceLayer(newVal);
            }
        },
        targetLayerSelection: {
            get () {
                return this.selectedTargetLayer; // mapped getter?
            },
            set (newVal) {
                this.clearResultLayer();

                if (newVal) {
                    newVal.setIsSelected(newVal.get("id"));
                    setTimeout(() => {
                        this.checkIntersection();
                    }, 1000);
                }
                this.setSelectedTargetLayer(newVal);
            }
        },
        inputRadius: {
            get () {
                return this.bufferRadius;
            },
            set (newVal) {
                if (newVal) {
                    this.clearResultLayer();
                    this.clearBufferLayer();
                    clearTimeout(this.timerId);
                    this.timerId = setTimeout(() => {
                        this.applyBufferRadius();
                    }, 1000);
                }
                this.setBufferRadius(newVal);
            }
        }
    },
    watch: {
        targetLayerSelection (layer, prev) {
            if (prev && layer) {
                prev.setIsSelected(false);
            }
        },
        sourceLayerSelection (layer, prev) {
            this.clearResultLayer();
            if (prev && !layer) {
                prev.setIsSelected(false);
            }
        }
    },

    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.setSourceOptions(Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"}));
        this.setMap(this.map);
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/LayerOverlapAnalysis", Object.keys(mutations)),
        ...mapActions("Map", ["toggleLayerVisibility"]),
        ...mapActions("Tools/LayerOverlapAnalysis", ["checkIntersection"]),
        clearResultLayer () {
            this.map.removeLayer(this.resultLayer);
        },
        clearBufferLayer () {
            this.map.removeLayer(this.bufferLayer);
        },
        applyBufferRadius () {
            const features = this.selectedSourceLayer.get("layerSource").getFeatures(),
                newFeatures = [],
                vectorSource = new VectorSource();

            this.setBufferLayer(new VectorLayer({
                source: vectorSource
            }));

            this.parser.inject(
                Point,
                LineString,
                LinearRing,
                Polygon,
                MultiPoint,
                MultiLineString,
                MultiPolygon
            );

            features.forEach(feature => {
                const jstsGeom = this.parser.read(feature.getGeometry()),
                    buffered = jstsGeom.buffer(this.inputRadius),
                    newFeature = new Feature({
                        geometry: this.parser.write(buffered),
                        name: "Buffers"
                    });

                newFeature.setStyle(this.bufferLayerStyle);
                newFeatures.push(newFeature);
            });

            vectorSource.addFeatures(newFeatures);

            this.map.addLayer(this.bufferLayer);
        },
        resetModule () {
            this.inputRadius = 0;
            this.sourceLayerSelection = null;
            this.targetLayerSelection = null;
            this.clearBufferLayer();
            this.clearResultLayer();
        },
        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.LayerOverlapAnalysis.id);

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
                id="layer-analysis"
            >
                <label
                    for="layer-analysis-select"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerOverlapAnalysis.selectLabel") }}</label>
                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select"
                        v-model="sourceLayerSelection"
                        class="font-arial form-control input-sm pull-left"
                    >
                        <option
                            v-for="layer in sourceOptions"
                            :key="layer.get('id')"
                            :value="layer"
                        >
                            {{ layer.get("name") }}
                        </option>
                    </select>
                </div>
                <label
                    for="layer-analysis-range"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerOverlapAnalysis.rangeLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <input
                        id="layer-analysis-range-text"
                        v-model="inputRadius"
                        :disabled="!sourceLayerSelection || targetLayerSelection"
                        min="0"
                        max="3000"
                        step="10"
                        class="font-arial form-control input-sm pull-left"
                        type="number"
                    >
                    <input
                        id="layer-analysis-range"
                        v-model="inputRadius"
                        :disabled="!sourceLayerSelection || targetLayerSelection"
                        min="0"
                        max="3000"
                        step="10"
                        class="font-arial form-control input-sm pull-left"
                        type="range"
                    >
                </div>
                <label
                    for="layer-analysis-select-target"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerOverlapAnalysis.selectLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select-target"
                        v-model="targetLayerSelection"
                        class="font-arial form-control input-sm pull-left"
                        :disabled="!sourceLayerSelection || !inputRadius || targetLayerSelection"
                    >
                        <option
                            v-for="layer in targetOptions"
                            :key="layer.get('id')"
                            :value="layer"
                        >
                            {{ layer.get("name") }}
                        </option>
                    </select>
                </div>

                <div class="col-md-12 col-sm-12 form-group form-group-sm">
                    <button
                        id="layer-analysis-reset-button"
                        class="btn-primary pull-right"
                        :disabled="!sourceLayerSelection"
                        @click="resetModule()"
                    >
                        {{ $t("modules.tools.layerOverlapAnalysis.clearBtn") }}
                    </button>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
