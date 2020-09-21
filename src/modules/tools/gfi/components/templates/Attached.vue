<script>
import {mapGetters} from "vuex";
import Default from "../themes/Default.vue";
import Schulinfo from "../themes/Schulinfo.vue";
import Solaratlas from "../themes/Solaratlas.vue";
import TrafficCount from "../themes/trafficCount/components/TrafficCount.vue";
import {upperFirst} from "../../../../../utils/stringHelpers";
import Overlay from "ol/Overlay.js";
import "bootstrap/js/tooltip";
import "bootstrap/js/popover";

export default {
    name: "Attached",
    components: {
        Default,
        Schulinfo,
        Solaratlas,
        TrafficCount
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            overlay: new Overlay({element: undefined})
        };
    },
    computed: {
        ...mapGetters("Map", ["clickCoord"]),
        /**
         * Returns the title of the gfi.
         * @returns {string} the title
         */
        title: function () {
            return this.feature.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {string} the name of the theme
         */
        theme: function () {
            return this.getTheme();
        },

        /**
         * Returns the custom style for the gfi window content.
         * it will make sure the gfi window in the browser window.
         * @returns {Object} the style in the object
         */
        styleContent: function () {
            const maxWidth = Math.round(document.getElementById("map").offsetWidth / 2.2) + "px",
                maxHeight = Math.round(document.getElementById("map").offsetHeight) - 300 - 34 - 43 + "px";

            return {
                "max-width": maxWidth,
                "max-height": maxHeight
            };
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.createOverlay();
            this.createPopover();
        });
    },
    beforeDestroy: function () {
        this.removePopover();
    },
    methods: {
        close () {
            this.removePopover();
            this.$emit("close");
        },

        /**
         * it will create an overlay for the attached theme
         * @returns {void}
         */
        createOverlay () {
            const gfipopup = document.createElement("DIV");

            // creating the overlay
            gfipopup.id = "gfipopup";
            document.body.appendChild(gfipopup);
            Radio.trigger("Map", "addOverlay", this.overlay);
            this.overlay.setElement(document.getElementById("gfipopup"));
            this.overlay.setPosition(this.clickCoord);
        },

        /**
         * it will create the popup window as attached theme
         * @returns {void}
         */
        createPopover () {
            $(this.overlay.getElement()).popover({
                content: this.$el,
                html: true,
                viewport: ".ol-viewport",
                placement: function () {
                    if (this.getPosition().top > document.getElementById("map").offsetHeight / 2) {
                        return "top";
                    }

                    return "bottom";

                }
            });

            $(this.overlay.getElement()).popover("show");
        },

        /**
         * it will remove the popup window as attached theme and make the standard gfi theme visible again
         * @returns {void}
         */
        removePopover () {
            if (this.overlay.getElement()) {
                $(this.overlay.getElement()).popover("destroy");
                $(this.overlay.getElement()).remove();
                Radio.trigger("Map", "removeOverlay", this.overlay);
            }
        },

        /**
         * Returns the right gfi Theme
         * it check if the right Theme (Component) is there, if yes just use this component, otherwise use the default theme
         * @returns {String} the name of the gfi Theme
         */
        getTheme () {
            const gfiComponents = Object.keys(this.$options.components),
                configTheme = upperFirst(this.feature.getTheme());

            let theme = "";

            if (gfiComponents && Array.isArray(gfiComponents) && gfiComponents.length && gfiComponents.includes(configTheme)) {
                theme = configTheme;
            }
            else {
                console.warn(String("The gfi theme '" + configTheme + "' could not be found, the default theme will be used. Please check your configuration!"));
                theme = "Default";
            }

            return theme;
        }
    }
};
</script>

<template>
    <div class="gfi-attached">
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
    .gfi-attached {
        background-color: #ffffff;
    }
    .gfi-header {
        font-size: 13px;
        font-weight: normal;
        line-height: 17px;
        color: #646262;
        padding: 0px 15px;
        border-bottom: 1px solid #e5e5e5;
        button {
            font-size: 16px;
            opacity: 0.6;
        }
    }
    .gfi-content {
        overflow: scroll;
        table {
            margin-bottom: 0;
        }
    }
</style>

<style lang="less">
    .ol-viewport {
        .popover {
            padding: 0;
            min-width: 40vw;
            border: 0;
            z-index: 1;
        }
        .popover-content {
            padding: 0;
        }
    }
</style>
