<script>
import Default from "../themes/default/components/Default.vue";
import Sensor from "../themes/sensor/components/Sensor.vue";
import {mapGetters} from "vuex";
import getTheme from "../../utils/getTheme";
import Overlay from "ol/Overlay.js";
import "bootstrap/js/tooltip";
import "bootstrap/js/popover";

export default {
    name: "Attached",
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
            overlay: new Overlay({element: undefined})
        };
    },
    computed: {
        ...mapGetters("Map", ["clickCoord"]),
        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return this.feature?.getTitle();
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
    mounted () {
        this.$nextTick(() => {
            this.createOverlay();
            this.createPopover();
        });
    },
    beforeDestroy () {
        Radio.trigger("Map", "removeOverlay", this.overlay);
    },
    methods: {
        close () {
            this.$emit("close");
        },

        /**
         * It will create an overlay for the attached theme.
         * @returns {void}
         */
        createOverlay () {
            const gfipopup = document.createElement("DIV");

            gfipopup.id = "gfipopup";
            document.body.appendChild(gfipopup);
            this.overlay.setElement(document.getElementById("gfipopup"));
            Radio.trigger("Map", "addOverlay", this.overlay);
            this.overlay.setPosition(this.clickCoord);
        },

        /**
         * It will create the popup window as attached theme.
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
                {{ $t(title) }}
            </h5>
        </div>
        <!-- theme -->
        <div
            class="gfi-content"
        >
            <component
                :is="theme"
                :feature="feature"
            />
        </div>
        <slot name="footer" />
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
        overflow: auto;
        table {
            margin-bottom: 0;
        }
    }
   @media (min-width: 768px) {
    .gfi-content {
        width: 100%;
        height: 40vh;
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
