<script>
import Default from "../themes/Default.vue";
import Schulinfo from "../themes/Schulinfo.vue";
import {upperFirst} from "../../../../../utils/stringHelpers";
import "jquery-ui/ui/widgets/draggable";

export default {
    name: "Detached",
    components: {
        Default,
        Schulinfo
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        /**
         * Returns the title of the gfi.
         * @returns {string} the title
         */
        title: function () {
            return this.feature.getTitle();
        },
        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component.
         * @returns {string} the name of the theme
         */
        theme: function () {
            return upperFirst(this.feature.getTheme());
        },
        /**
         * Returns the custom style for the gfi window.
         * it will always show the window on the top right.
         * @returns {Object} the style in the object
         */
        styleObject: function () {
            const maxWidth = Math.round(document.getElementById("map").offsetWidth / 2.2) + "px",
                right = document.getElementsByClassName("right-bar")[0].offsetWidth + 10 + "px",
                maxHeight = window.innerHeight - 100 - 34 - 43 + "px"; // 100 pixer for the navi. 34 for header, 43 is the distance from bottom

            return {
                "max-width": maxWidth,
                "max-height": maxHeight,
                "right": right
            };
        }
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
    },
    methods: {
        close () {
            this.$emit("close");
        }
    }
};
</script>

<template>
    <div
        class="gfi-detached"
        :style="styleObject"
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
    .gfi-detached {
        position: absolute;
        min-width: 250px;
        top: 50px;
        overflow: scroll;
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
        table {
            margin-bottom: 0;
        }
    }
</style>
