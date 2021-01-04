<script>
import Default from "../themes/default/components/Default.vue";
import Sensor from "../themes/sensor/components/Sensor.vue";
import getTheme from "../../utils/getTheme";
import {mapGetters, mapActions} from "vuex";
import "jquery-ui/ui/widgets/draggable";

export default {
    name: "Table",
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
        this.$nextTick(function () {
            $(".gfi-detached-table").draggable({
                containment: "#map",
                handle: ".gfi-header",
                drag: function () {
                    const rotAngle = this.style.transform;
                    let transformOrigin;

                    if (rotAngle === "rotate(0deg)" || rotAngle === "rotate(-180deg)" || rotAngle === "") {
                        transformOrigin = "50% 50%";
                    }
                    else if (rotAngle === "rotate(-90deg)") {
                        transformOrigin = "40% 70%";
                    }
                    else if (rotAngle === "rotate(-270deg)") {
                        transformOrigin = "30% 50%";

                    }
                    this.style.msTransformOrigin = transformOrigin;
                    this.style.webkitTransformOrigin = transformOrigin;
                    this.style.mozTransformOrigin = transformOrigin;
                    this.style.right = "inherit";
                }
            });
        });

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
            const width = this.$el.getElementsByClassName("gfi-header")[0].offsetWidth,
                headerHeight = this.$el.getElementsByClassName("gfi-header")[0].offsetHeight;

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
    <div class="gfi-detached-table">
        <!-- header -->
        <div
            class="gfi-header"
            @touchmove="move"
        >
            <p class="buttons pull-right">
                <span
                    class="icon-turnarticle"
                    @click="rotate"
                >
                </span>
                <span
                    class="glyphicon glyphicon-remove"
                    @click="close"
                >
                </span>
            </p>
            <p class="title">
                <span class="gfi-title">{{ $t(title) }}</span>
            </p>
        </div>
        <!-- theme -->
        <div class="gfi-content">
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
@color_1: #808080;
@font_family_1: "MasterPortalFont";
@background_color_1: #F2F2F2;

.gfi-detached-table {
    position: absolute;
    min-width: 250px;
    right: 0;
    margin: 10px 10px 30px 10px;
    box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    background-color: @background_color_1;
    max-width: 360px;
    max-height: 260px;
    font-family: @font_family_1;
    color: @color_1;
    top: 250px;
    touch-action: pan-x pan-y;
    >.gfi-header {
        font-size: 14px;
        padding: 8px;
        border-bottom: 1px solid #808080;
        border-radius: 11px 11px 0px 0px;
        background-color: #646262;
        color: #F2F2F2;
        &.ui-draggable-handle {
            cursor: move;
        }
        .title {
            color: #F2F2F2;
            margin-right: 50px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        >.buttons {
            margin: 0 0 0 10px;
            cursor: pointer;
            font-size: 16px;
        }
    }
    >.gfi-content {
        max-height: 175px;
        overflow-x: hidden;
    }
    .gfi-content::-webkit-scrollbar {
        width: 20px;
    }
    .gfi-content::-webkit-scrollbar-track {
        border: 5px solid transparent;
        border-radius: 12px;
        background-clip: content-box;
        background-color: #d3d3d3;
    }

    .gfi-content::-webkit-scrollbar-thumb {
        background-color: #003063;
        border: 6px solid transparent;
        border-radius: 12px;
        background-clip: content-box;
    }
    >.gfi-footer {
        >.pager-left {
            border-bottom-left-radius: 12px;
        }
        >.pager-right {
            border-bottom-right-radius: 12px;
        }
    }
    .icon-turnarticle {
        color: #f2f2f2;
        position: relative;
        display: inline-block;
        bottom: 20px;
        right: 25px;
    }

    .icon-turnarticle::before {
        color: #F2F2F2;
    }
    span.glyphicon.glyphicon-remove::before {
        color: #F2F2F2;
    }
}

</style>
