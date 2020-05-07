<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

export default {
    name: "TotalView",
    components: {
        ControlIcon
    },
    props: {
        glyphicon: {
            type: String,
            default: "fast-backward"
        },
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
    @import "../../../../variables.less";

    // TODO implement ControlIcon-like component for DIPAS to use alternatively; this css probably removable then
    .total-view-menuelement {
        display: block;
        text-align: center;
        color: @menu_element_color;
        padding-bottom: 5px;
        font-size: 12px;
        >.glyphicon {
            font-size: 16px;
        }
    }
</style>
