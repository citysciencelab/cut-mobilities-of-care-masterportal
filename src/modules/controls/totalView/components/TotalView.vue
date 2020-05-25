<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

/**
 * TotalView adds a control that lets the user reset the
 * view's state to the initial zoom and center coordinates.
 */
export default {
    name: "TotalView",
    components: {
        ControlIcon
    },
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
        ...mapGetters("Map", ["hasMoved"])
    },
    methods: {
        ...mapActions("Map", ["resetView"])
    }
};
</script>

<template>
    <div class="back-forward-buttons">
        <ControlIcon
            id="start-totalview"
            class="total-view-button"
            :title="$t('common:modules.controls.totalView.titleButton')"
            :active="hasMoved"
            :icon-name="glyphicon"
            :on-click="resetView"
        />
        <!-- TODO style === TABLE
            $t common:modules.controls.totalView.titleMenu
            <div class='total-view-menuelement' id='start-totalview'><span class='glyphicon icon-home'></span></br>" + title + "</div>
        -->
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
