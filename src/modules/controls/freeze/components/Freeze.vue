<script>
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "Freeze",
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
            const freeView = document.getElementById("freeze-view");

            freeView.className = "freeze-view freeze-activated";
        }
    }
};
</script>

<template>
    <div class="freeze-view-start">
        <component
            :is="component"
            :title="$t(`common:modules.controls.freeze.freeze`)"
            :icon-name="'ban-circle'"
            :on-click="showFreezeWin"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
    @color: #f3f3f3;

    .controls-row-right {
        .freeze-view-start {
            margin-top: 20px;
        }
    }
</style>
