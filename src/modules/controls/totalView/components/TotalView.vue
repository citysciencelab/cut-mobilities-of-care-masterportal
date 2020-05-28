<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";

/**
 * TotalView adds a control that lets the user reset the
 * view's state to the initial zoom and center coordinates.
 */
export default {
    name: "TotalView",
    props: {
        /** glyphicon name for the control icon */
        glyphicon: {
            type: String,
            default: "fast-backward"
        },
        /** glyphicon name for the control icon in style table */
        tableGlyphicon: {
            type: String,
            default: "home"
        }
    },
    computed: {
        ...mapGetters("Map", ["hasMoved"]),
        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        },
        glyphiconToUse () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? this.tableGlyphicon : this.glyphicon;
        }
    },
    methods: {
        ...mapActions("Map", ["resetView"])
    }
};
</script>

<template>
    <div class="back-forward-buttons">
        <component
            :is="component"
            id="start-totalview"
            class="total-view-button"
            :title="$t('common:modules.controls.totalView.titleButton')"
            :disabled="!hasMoved"
            :icon-name="glyphiconToUse"
            :on-click="resetView"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
