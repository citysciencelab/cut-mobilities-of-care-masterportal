<script>
import {mapGetters, mapActions} from "vuex";
import getComponent from "../../../../utils/getComponent";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature";
import {Vector as VectorLayer} from "ol/layer";
import Tool from "../../Tool.vue";
import getters from "../store/gettersLayerAnalysis";
import * as jsts from "jsts/dist/jsts";
import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

/**
 * Tool to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 */
export default {
    name: "LayerAnalysis",
    components: {
        Tool
    },
    data () {
        return {
            selectedSourceLayer: null,
            selectedTargetLayer: null,
            bufferRadius: 0,
            timerId: null,
            parser: new jsts.io.OL3Parser(),
            GeoJSONWriter: new jsts.io.GeoJSONWriter(),
            vectorLayer: {},
            resultLayer: {}
        };
    },
    computed: {
        ...mapGetters("Tools/LayerAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["map"]),
        sourceOptions: {
            get () {
                return Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"});
            }
        },
        targetOptions: {
            get () {
                let options = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"});

                if (this.selectedSourceLayer) {
                    options = options.filter(layer => {
                        return layer.get("id") !== this.selectedSourceLayer.get("id");
                    });
                }
                return options;
            }
        }
    },
    watch: {
        selectedSourceLayer (layer) {
            this.clearResult();
            this.selectedTargetLayer = null;
            if (layer) {
                this.sourceOptions.forEach(option => {
                    option.setIsSelected(layer.get("id") === option.get("id"));
                });
            }
            if (this.bufferRadius) {
                this.clearBuffer();
                clearTimeout(this.timerId);
                this.timerId = setTimeout(() => {
                    this.applyBufferRadius();
                }, 1000);
            }
        },
        selectedTargetLayer (layer, prev) {
            this.clearResult();
            if (prev) {
                prev.setIsSelected(false);
            }
            if (layer) {
                layer.setIsSelected(layer.get("id"));
            }
            setTimeout(() => {
                this.checkIntersection();
            }, 1000);
        },
        bufferRadius () {
            this.clearResult();
            this.clearBuffer();
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                this.applyBufferRadius();
            }, 1000);
        }
    },

    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);
    },
    methods: {
        clearResult () {
            this.map.removeLayer(this.resultLayer);
        },
        checkIntersection () {
            const resultFeatures = [];

            this.selectedTargetLayer.get("layerSource").getFeatures().forEach(targetFeature => {
                let foundIntersection = false;

                this.vectorLayer.getSource().getFeatures().forEach(sourceFeature => {
                    const sourceGeometry = sourceFeature.getGeometry(),
                        targetGeometry = targetFeature.getGeometry();


                    if (targetFeature.getGeometry().getType() === "Point") {
                        if (sourceGeometry.intersectsCoordinate(targetGeometry.getCoordinates())) {
                            foundIntersection = true;
                        }
                    }
                    else {
                        const poly1 = this.parser.read(sourceGeometry),
                            poly2 = this.parser.read(targetGeometry);

                        if (poly1.intersects(poly2)) {
                            foundIntersection = true;
                        }
                    }

                });
                if (!foundIntersection) {
                    resultFeatures.push(targetFeature);
                }
            });
            if (resultFeatures) {
                const vectorSource = new VectorSource();

                this.resultLayer = new VectorLayer({
                    source: vectorSource
                });

                vectorSource.addFeatures(resultFeatures);
                this.map.addLayer(this.resultLayer);
                this.sourceOptions.forEach(option => {
                    option.setIsSelected(false);
                });
                this.clearBuffer();
            }

        },
        clearBuffer () {
            this.map.removeLayer(this.vectorLayer);
        },
        applyBufferRadius () {
            const features = this.selectedSourceLayer.get("layerSource").getFeatures(),
                newFeatures = [],
                vectorSource = new VectorSource();

            this.vectorLayer = new VectorLayer({
                source: vectorSource
            });

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
                    buffered = jstsGeom.buffer(this.bufferRadius);

                newFeatures.push(new Feature({
                    geometry: this.parser.write(buffered),
                    name: "Buffers"
                }));
            });

            vectorSource.addFeatures(newFeatures);

            this.map.addLayer(this.vectorLayer);
        },
        ...mapActions("Map", ["toggleLayerVisibility"]),
        // ...mapMutations("Tools/ScaleSwitcher", Object.keys(mutations)),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.LayerAnalysis.id);

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
                >{{ $t("modules.tools.layerAnalysis.selectLabel") }}</label>
                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select"
                        v-model="selectedSourceLayer"
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
                >{{ $t("modules.tools.layerAnalysis.rangeLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <input
                        id="layer-analysis-range-text"
                        v-model="bufferRadius"
                        :disabled="!selectedSourceLayer"
                        min="0"
                        max="3000"
                        step="10"
                        class="font-arial form-control input-sm pull-left"
                        type="number"
                    >
                    <input
                        id="layer-analysis-range"
                        v-model="bufferRadius"
                        :disabled="!selectedSourceLayer"
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
                >{{ $t("modules.tools.layerAnalysis.selectLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select-target"
                        v-model="selectedTargetLayer"
                        class="font-arial form-control input-sm pull-left"
                        :disabled="!selectedSourceLayer || !bufferRadius"
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
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
