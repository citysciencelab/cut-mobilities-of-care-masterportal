<script>
import Default from "../themes/default/components/Default.vue";
import Sensor from "../themes/sensor/components/Sensor.vue";
import getTheme from "../../utils/getTheme";
import {mapGetters, mapMutations, mapActions} from "vuex";
import ToolWindow from "../../../../../share-components/ToolWindow.vue";

export default {
    name: "Detached",
    components: {
        Default,
        Sensor,
        ToolWindow
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            isContentHtml: false
        };
    },
    computed: {
        ...mapGetters("Map", ["clickCoord"]),
        ...mapGetters("Tools/Gfi", ["centerMapToClickPoint", "showMarker", "highlightVectorRules", "currentFeature"]),

        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return this.feature.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
         */
        theme: function () {
            return getTheme(this.feature.getTheme(), this.$options.components, this.$gfiThemeAddons);
        }
    },
    watch: {
        currentFeature: function () {
            this.highlightVectorFeature();
        }
    },
    created: function () {
        if (this.feature.getMimeType() === "text/html") {
            this.isContentHtml = true;
        }
        this.$on("hidemarker", () => {
            this.hideMarker();
        });
    },
    mounted: function () {
        this.highlightVectorFeature();
        this.setMarker();
    },
    beforeDestroy: function () {
        this.removeHighlighting();
        this.removePointMarker();
    },
    methods: {
        ...mapMutations("Map", ["setCenter"]),
        ...mapMutations("Tools/Gfi", ["setShowMarker"]),
        ...mapActions("MapMarker", ["removePointMarker", "placingPointMarker"]),
        ...mapActions("Map", ["highlightFeature", "removeHighlightFeature"]),
        close () {
            this.$emit("close");
        },

        /**
         * Sets the center of the view on the clickCoord and place the MapMarker on it
         * Set Marker and Center.
         * @returns {void}
         */
        setMarker () {
            if (this.showMarker) {
                if (this.centerMapToClickPoint) {
                    this.setCenter(this.clickCoord);
                }

                this.placingPointMarker(this.clickCoord);
            }
        },
        /**
         * Hides the map marker
         * @returns {void}
         */
        hideMarker () {
            this.setShowMarker(false);
        },
        /**
         * Highlights a vector feature
         * @returns {void}
         */
        highlightVectorFeature () {
            if (this.highlightVectorRules) {
                this.removeHighlighting();
                if (this.feature.getOlFeature()?.getGeometry()?.getType() === "Point") {
                    this.highlightFeature({
                        feature: this.feature.getOlFeature(),
                        type: "increase",
                        scale: this.highlightVectorRules.image.scale,
                        layer: {id: this.feature.getLayerId()}
                    });
                }
                else if (this.feature.getOlFeature()?.getGeometry()?.getType() === "Polygon") {
                    this.highlightFeature({
                        feature: this.feature.getOlFeature(),
                        type: "highlightPolygon",
                        highlightStyle: {
                            fill: this.highlightVectorRules.fill, stroke: this.highlightVectorRules.stroke
                        },
                        layer: {id: this.feature.getLayerId()}
                    });
                }
            }
        },
        /**
         * Removes the feature highlighting
         * @returns {void}
         */
        removeHighlighting: function () {
            this.removeHighlightFeature();
        }
    }
};
</script>

<template>
    <ToolWindow @close="close">
        <template v-slot:title>
            <span>{{ $t(title) }}</span>
        </template>
        <template v-slot:body>
            <component
                :is="theme"
                :feature="feature"
            />
            <slot name="footer" />
        </template>
    </ToolWindow>
</template>
