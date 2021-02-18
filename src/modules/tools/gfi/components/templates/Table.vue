<script>
import Default from "../themes/default/components/Default.vue";
import Sensor from "../themes/sensor/components/Sensor.vue";
import getTheme from "../../utils/getTheme";
import {mapGetters, mapActions} from "vuex";
import ToolWindow from "../../../../../share-components/ToolWindow.vue";

export default {
    name: "Table",
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
            rotateAngle: 0
        };
    },
    computed: {
        ...mapGetters("Map", ["clickCoord"]),
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
    mounted: function () {
        this.placingPointMarker(this.clickCoord);
    },
    beforeDestroy: function () {
        this.removePointMarker();
    },
    methods: {
        ...mapActions("MapMarker", ["removePointMarker", "placingPointMarker"]),

        close () {
            this.$emit("close");
        },
        rotate () {
            const width = this.$el.getElementsByClassName("tool-window-heading")[0].offsetWidth,
                headerHeight = this.$el.getElementsByClassName("tool-window-heading")[0].offsetHeight;

            this.rotateAngle = this.rotateAngle - 90;
            if (this.rotateAngle === -360) {
                this.rotateAngle = 0;
            }

            this.$el.style.transform = "rotate(" + this.rotateAngle + "deg)";
            this.$el.style.WebkitTransform = width - 20 + "px " + headerHeight + "px";
            this.$el.style.msTransform = width - 20 + "px " + headerHeight + "px";
            this.$el.style.MozTransform = width - 20 + "px " + headerHeight + "px";

        },

        /**
         * Calculates the new position for the gfi-header container by touchmove event.
         * draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport.
         * @param {Event} evt The touch event.
         * @returns {void}
         */
        move: function (evt) {
            const touch = evt.touches[0],
                headerWidth = this.$el.getElementsByClassName("gfi-header")[0].offsetWidth,
                width = this.$el.getElementsByClassName("gfi-header")[0].offsetWidth / 2,
                height = this.$el.offsetHeight,
                headerHeight = this.$el.getElementsByClassName("gfi-header")[0].offsetHeight,
                rotAngle = this.rotateAngle,
                transformOrigin = headerWidth - 20 + "px " + headerHeight + "px",
                map = document.getElementById("map"),
                gfiConent = this.$el.getElementsByClassName("gfi-content")[0];
            let x,
                y;

            if (rotAngle === 0) {
                x = touch.clientX - width - 20;
                y = touch.clientY - headerHeight;
                if (x >= 0 && x < (map.offsetWidth - gfiConent.offsetWidth - 10) && y >= 0 && y < (map.offsetHeight - gfiConent.offsetHeight - 75)) {
                    this.movedGfiHeaderPositionBy(x, y, transformOrigin);
                }
            }
            else if (rotAngle === -90) {
                x = touch.clientX - headerWidth + 20;
                y = touch.clientY - width + 20;
                if (x + height >= 0 && x < (map.offsetWidth - 1.5 * headerWidth - 75) && y >= 0 + headerHeight && y < (map.offsetHeight - headerWidth - 10)) {
                    this.movedGfiHeaderPositionBy(x, y, transformOrigin);
                }
            }
            else if (rotAngle === -180) {
                x = touch.clientX - headerWidth - width + 20;
                y = touch.clientY - headerHeight;
                if (x + 1.5 * width >= 0 && x < (map.offsetWidth - 2 * headerWidth) && y - height >= 0 && y < (map.offsetHeight - height / 2)) {
                    this.movedGfiHeaderPositionBy(x, y, transformOrigin);
                }
            }
            else if (rotAngle === -270) {
                x = touch.clientX - headerWidth;
                y = touch.clientY + width - 20;
                if (x + height / 2 - headerHeight >= 0 && x < (map.offsetWidth - headerWidth - 50) && y - headerWidth >= 0 && y < (map.offsetHeight - headerWidth + width)) {
                    this.movedGfiHeaderPositionBy(x, y, transformOrigin);
                }
            }
        },

        /**
         * Sets the position on the screen for the gfi-Header container by move that.
         * @param {Number} x The position on the x-axis.
         * @param {Number} y The position on the y-axis.
         * @param {String} transformOrigin The transform origin.
         * @returns {void}
         */
        movedGfiHeaderPositionBy: function (x, y, transformOrigin) {
            this.$el.style.left = x + "px";
            this.$el.style.top = y + "px";
            this.$el.style.msTransformOrigin = transformOrigin;
            this.$el.style.webkitTransformOrigin = transformOrigin;
            this.$el.style.mozTransformOrigin = transformOrigin;
            this.$el.style.right = "inherit";
        }
    }
};
</script>

<template>
    <ToolWindow
        class="gfi-detached-table"
        @close="close"
    >
        <template v-slot:rightOfTitle>
            <span
                class="icon-turnarticle glyphicon"
                @click="rotate"
            >
            </span>
        </template>
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

<style lang="less">
@color_1: #808080;
@font_family_1: "MasterPortalFont";
@background_color_1: #F2F2F2;
@background_color_2: #646262;

.gfi-detached-table {
    box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    background-color:  @background_color_2;
    font-family: @font_family_1;
    color: @color_1;
    .tool-window-heading{
        padding: 0;
        border-bottom: 1px solid @color_1;
        border-radius: 11px 11px 0px 0px;
        background-color: @background_color_2;
        color:@background_color_1;
        padding-top: 8px;
        padding-left: 8px;
        .tool-window-heading-title {
            color: @background_color_1;
            margin-right: 50px;
            text-overflow: ellipsis;
        }
    }
    .vue-tool-content-body {
        max-height: 175px;
        overflow-x: hidden;
    }
    .icon-turnarticle {
        color: @background_color_1;
        position: relative;
        display: inline-block;
        bottom: 20px;
        right: 25px;
          margin: 0 0 0 10px;
            cursor: pointer;
            font-size: 16px;
    }
    .icon-turnarticle::before {
        color: @background_color_1;
    }
    span.glyphicon.glyphicon-remove::before {
        color: @background_color_1;
    }
}

</style>
