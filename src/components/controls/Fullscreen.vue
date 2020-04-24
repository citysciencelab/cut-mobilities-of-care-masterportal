
<script>
// "$t('common:modules.controls.fullScreen.enable')"
import ControlIcon from "./ControlIcon.vue";


export default {
    name: "Fullscreen",
    components: {
        ControlIcon
    },
    data: function () {
        return {
            active: this.isFullscreen(),
            fullscreenAvailable: this.isFullscreenAvailable()
        };
    },
    created () {
        window.addEventListener("resize", this.updateActive);
    },
    beforeDestroy () {
        window.removeEventListener("resize", this.updateActive);
    },
    methods: {
        updateActive: function () {
            this.active = this.isFullscreen();
        },
        isFullscreen: function () {
            return window.fullScreen || (window.innerWidth === screen.width && window.innerHeight === screen.height);
        },
        isFullscreenAvailable: function () {
            return false; // TODO
        },
        toggleFullscreen: function () {
            if (this.active) {
                document.exitFullscreen();
            }
            else {
                document.documentElement.requestFullscreen();
            }
        }
    }
};
</script>

<template>
    <div
        v-if="fullscreenAvailable"
        class="fullscreen-button"
    >
        <ControlIcon
            :title="$t(active ? 'common:modules.controls.fullScreen.disable' : 'common:modules.controls.fullScreen.enable')"
            :icon-name="active ? 'resize-small' : 'fullscreen'"
            :on-click="toggleFullscreen"
        />
    </div>
</template>

<style lang="less" scoped>
@import "../../variables.less";
</style>
