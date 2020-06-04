<script>
import {mapGetters, mapMutations} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

/**
 * The BackForward control element allows stepping back
 * and forth through view states regarding zoom and center.
 */
export default {
    name: "BackForward",
    components: {
        ControlIcon
    },
    props: {
        /** glyphicon name of the forward button */
        glyphiconFor: {
            type: String,
            default: "glyphicon-step-forward"
        },
        /** glyphicon name of the backward button */
        glyphiconBack: {
            type: String,
            default: "glyphicon-step-backward"
        }
    },
    computed: {
        ...mapGetters("controls/backForward", ["forthAvailable", "backAvailable"]),
        ...mapGetters("Map", ["map"])
    },
    mounted () {
        this.map.on("moveend", this.memorizeMap);
    },
    beforeDestroy () {
        this.map.un("moveend", this.memorizeMap);
    },
    methods: {
        ...mapMutations(
            "controls/backForward",
            ["forward", "backward", "memorize"]
        ),
        memorizeMap () {
            this.memorize(this.map);
        },
        moveForward () {
            this.forward(this.map);
        },
        moveBackward () {
            this.backward(this.map);
        }
    }
};
</script>

<template>
    <div class="back-forward-buttons">
        <ControlIcon
            class="forward"
            :title="$t(`common:modules.controls.backForward.stepForward`)"
            :disabled="!forthAvailable"
            :icon-name="glyphiconFor"
            :on-click="moveForward"
        />
        <ControlIcon
            class="backward"
            :title="$t(`common:modules.controls.backForward.stepBackward`)"
            :disabled="!backAvailable"
            :icon-name="glyphiconBack"
            :on-click="moveBackward"
        />
    </div>
</template>

<style lang="less" scoped>
</style>
