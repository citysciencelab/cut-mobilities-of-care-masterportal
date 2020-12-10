<script>
import Default from "../themes/default/components/Default.vue";
import Sensor from "../themes/sensor/components/Sensor.vue";
import getTheme from "../../utils/getTheme";
import {mapGetters, mapMutations, mapActions} from "vuex";
import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/resizable";

export default {
    name: "Detached",
    components: {
        Default,
        Sensor
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
        },

        /**
         * Returns the custom style for the gfi window.
         * it will always show the window on the top right.
         * @returns {Object} the style in the object
         */
        styleAll: function () {
            const rightBarWidth = document.getElementsByClassName("right-bar")[0].offsetWidth;

            if (document.getElementsByClassName("sidebar")[0]) {
                return {
                    "right": rightBarWidth + 10 + document.getElementsByClassName("sidebar")[0].offsetWidth + "px"
                };
            }

            return {
                "right": rightBarWidth + 10 + "px"
            };
        },

        /**
         * Returns the custom style for the gfi content.
         * it will make the content croll.
         * @returns {Object} the style in the object
         */
        styleContent: function () {
            if (this.isContentHtml) {
                return {
                    "max-width": "inherit",
                    "max-height": "inherit"
                };
            }
            return {
                "max-width": Math.round(document.getElementById("map").offsetWidth / 2.2) + "px",
                "max-height": window.innerHeight - 100 - 34 - 83 + "px" // 100 pixer for the navi. 34 for header, 83 is the distance from bottom
            };
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
        this.$nextTick(function () {
            $(".gfi-detached").draggable({
                containment: "#map",
                handle: ".gfi-header",
                drag: function (evt, ui) {
                    ui.helper[0].style.right = "inherit";
                },
                stop: function (evt, ui) {
                    ui.helper[0].style.left = (ui.position.left + 1) + "px";
                }
            });
        });

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
    <div
        class="gfi-detached"
        :style="styleAll"
    >
        <!-- header -->
        <div class="gfi-header">
            <button
                type="button"
                class="close"
                aria-label="Close"
                @click="close"
            >
                <span
                    class="glyphicon glyphicon-remove"
                >
                </span>
            </button>
            <h5>
                {{ $t(title) }}
            </h5>
        </div>
        <!-- theme -->
        <div
            class="gfi-content"
            :style="styleContent"
        >
            <component
                :is="theme"
                :feature="feature"
            />
        </div>
        <!-- footer -->
        <div class="gfi-footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<style lang="less" scoped>
    .gfi-detached {
        position: absolute;
        min-width: 250px;
        top: 50px;
        margin: 10px 10px 30px 10px;
        background-color: #ffffff;
        box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.3);
    }
    .gfi-header {
        font-size: 13px;
        font-weight: normal;
        line-height: 17px;
        color: #646262;
        padding: 0px 15px;
        border-bottom: 1px solid #e5e5e5;
        &.ui-draggable-handle {
            cursor: move;
        }
        button {
            font-size: 16px;
            opacity: 0.6;
        }
    }
    .gfi-content {
        overflow: auto;
        table {
            margin-bottom: 0;
        }
    }
</style>
