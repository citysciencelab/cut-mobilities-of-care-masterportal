<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import * as toolConstants from "../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../../shared/constants/mobilityData";
import actions from "../store/actionsMobilityDataDraw";
import getters from "../store/gettersMobilityDataDraw";
import mutations from "../store/mutationsMobilityDataDraw";

export default {
    name: "ScrollContainerWithShadows"
};
</script>

<template lang="html">
    <div class="scroll-container">
        <div class="shadow shadow-top"></div>
        <div class="shadow shadow-bottom"></div>

        <div class="scroll-inner">
            <slot />
        </div>
    </div>
</template>

<style lang="less" scoped>
.scroll-container {
    overflow: auto;
}

.shadow {
    position: sticky;
    z-index: 3;
    height: 15px;
    -webkit-backface-visibility: hidden;

    &::before,
    &::after {
        content: "";
        position: sticky;
        display: block;
    }

    &::before {
        height: 1px;
    }

    &::after {
        z-index: 2;
        height: 10px;
    }
}

.shadow-top {
    top: -15px;

    &::before {
        top: -1px;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
    }

    &::after {
        top: -20px;
        background: linear-gradient(
            var(--mobility-data-draw-background-color-hex) 40%,
            rgba(var(--mobility-data-draw-background-color-rgb), 0.3)
        );
    }
}

.shadow-bottom {
    top: 100%;

    &::before {
        top: 100%;
        box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.5);
    }

    &::after {
        top: calc(100% - 10px);
        background: linear-gradient(
            rgba(var(--mobility-data-draw-background-color-rgb), 0.3),
            var(--mobility-data-draw-background-color-hex) 60%
        );
    }
}

.scroll-inner {
    margin: -20px 0 10px;
}
</style>
