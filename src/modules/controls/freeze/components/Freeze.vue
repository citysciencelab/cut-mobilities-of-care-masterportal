<script>
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import FreezeWindow from "./FreezeWindow.vue";

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "Freeze",
    components: {
        FreezeWindow,
        ControlIcon
    },
    data: function () {
        return {
            isActive: false
        };
    },
    computed: {
        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        }
    },
    methods: {
        /**
         * showing the freezed window
         * @returns {void}
         */
        showFreezeWin () {
            this.isActive = true;
        },

        /**
         * hiding the freezed window
         * @returns {void}
         */
        hideFreezeWin () {
            this.isActive = false;
        }
    }
};
</script>

<template>
    <div class="freeze-view-start">
        <component
            :is="component"
            :class="[component ? 'control' : 'Table']"
            :title="$t(`common:modules.controls.freeze.freeze`)"
            :icon-name="'ban-circle'"
            :on-click="showFreezeWin"
        />
        <FreezeWindow
            v-if="isActive"
            @hideFreezeWin="hideFreezeWin"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .controls-row-right {
        .freeze-view-start {
            margin-top: 20px;
        }
    }
</style>
