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
            const className = this.$el.className.substring(0, this.$el.className.indexOf("rotate")).trim();

            this.rotateAngle = this.rotateAngle - 90;
            if (this.rotateAngle === -360) {
                this.rotateAngle = 0;
            }
            this.$el.className = className + " rotate" + this.rotateAngle;
        }
    }
};
</script>

<template>
    <ToolWindow
        class="gfi-detached-table rotate0"
        :initialWidth="360"
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
    touch-action: pan-x pan-y;
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
    .vue-tool-content-body::-webkit-scrollbar {
        width: 20px;
    }
    .vue-tool-content-body::-webkit-scrollbar-track {
        border: 5px solid transparent;
        border-radius: 12px;
        background-clip: content-box;
        background-color: #d3d3d3;
    }

    .vue-tool-content-body::-webkit-scrollbar-thumb {
        background-color: #003063;
        border: 6px solid transparent;
        border-radius: 12px;
        background-clip: content-box;
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
.rotate0{
    transform: rotate(0deg);
}
.rotate-90{
    transform: rotate(-90deg);
}
.rotate-180{
    transform: rotate(-180deg);
}
.rotate-270{
    transform: rotate(-270deg);
}

</style>
