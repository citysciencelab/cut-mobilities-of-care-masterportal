<script>
import Default from "../themes/components/Default.vue";
import {mapGetters, mapMutations} from "vuex";
import upperFirst from "../../../../../utils/upperFirst";
import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/resizable";

export default {
    name: "Detached",
    components: {
        Default
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            // flag if gfi content is html
            isContentHtml: false,
            showMarker: true
        };
    },
    computed: {
        ...mapGetters("Map", ["clickCoord"]),
        ...mapGetters("Tools/Gfi", ["centerMapToClickPoint"]),

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
            return this.getTheme();
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
    created: function () {
        if (typeof this.feature.getGfiUrl === "function" && this.feature.getGfiUrl() !== "") {
            this.isContentHtml = true;
        }
        this.$on("hidemarker", () => {
            this.showMarker = false;
        });
    },
    mounted: function () {
        this.$nextTick(function () {
            $(".gfi-detached").draggable({
                containment: "#map",
                handle: ".gfi-header",
                drag: function () {
                    $(".gfi-detached").css("right", "inherit");
                },
                stop: function (evt, ui) {
                    $(".gfi-detached").css("left", (ui.position.left + 1) + "px");
                }
            });
        });

        if (this.isContentHtml) {
            this.makeResizable();
        }
        this.setMarker();
    },
    beforeDestroy: function () {
        // TODO replace trigger when MapMarker is migrated
        Radio.trigger("MapMarker", "hideMarker");
    },
    methods: {
        ...mapMutations("Map", ["setCenter"]),
        close () {
            this.$emit("close");
        },

        /**
         * Returns the right gfi Theme
         * it check if the right Theme (Component) is there, if yes just use this component, otherwise use the default theme
         * @returns {String} the name of the gfi Theme
         */
        getTheme () {
            const gfiComponents = Object.keys(this.$options.components),
                gfiTheme = this.feature.getTheme(),
                configTheme = upperFirst(typeof gfiTheme === "object" ? gfiTheme.name : gfiTheme);

            let theme = "";

            if (gfiComponents && Array.isArray(gfiComponents) && gfiComponents.length && gfiComponents.includes(configTheme)) {
                theme = configTheme;
            }
            else if (this.$themeAddons && this.$themeAddons.includes(configTheme)) { // handling of addon-themes
                theme = configTheme;
            }
            else {
                console.warn(String("The gfi theme '" + configTheme + "' could not be found, the default theme will be used. Please check your configuration!"));
                theme = "Default";
            }

            return theme;
        },

        /**
         * Sets the center of the view on the clickCoord and place the MapMarker on it
         * Set Marker and Center.
         * @returns {Void}  -
         */
        setMarker () {
            if (this.showMarker) {
                if (this.centerMapToClickPoint) {
                    this.setCenter(this.clickCoord);
                }
                // TODO replace trigger when MapMarker is migrated
                Radio.trigger("MapMarker", "showMarker", this.clickCoord);
            }
        },

        /**
         * Makes this Component resizable
         * @returns {Void}  -
         */
        makeResizable () {
            $(".gfi-detached").resizable({
                minHeight: 440,
                resize: function (e, ui) {
                    $(".gfi-detached").find("iframe").css("height", ui.size.height - 60);
                }
            });
            $(".gfi-detached").css("maxWidth", "inherit");
            $(".gfi-detached").css("minWidth", "45vw");
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
                {{ title }}
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
