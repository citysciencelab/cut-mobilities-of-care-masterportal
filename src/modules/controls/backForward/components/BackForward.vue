<script>
import {mapGetters, mapMutations} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

export default {
    name: "BackForward",
    components: {
        ControlIcon
    },
    props: {
        glyphiconFor: {
            type: String,
            default: "glyphicon-step-forward"
        },
        glyphiconBack: {
            type: String,
            default: "glyphicon-step-backward"
        }
    },
    computed: {
        ...mapGetters("controls/backForward", ["forthAvailable", "backAvailable"]),
        ...mapGetters("Map", ["map"])
    },
    /*
     * NOTE This is how an addon could register itself to the appropriate store region
     *      Maybe it's also desirable to offer an ["addons"] module for such cases?
    created () {
        // import storeModule from "./module.js"; (above!)
        this.$store.registerModule(["controls", "backForward"], storeModule);
    },
     */
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
            :title="$t(`common:modules.controls.backForward.stepForward`)"
            :active="forthAvailable"
            :icon-name="glyphiconFor"
            :on-click="moveForward"
        />
        <ControlIcon
            :title="$t(`common:modules.controls.backForward.stepBackward`)"
            :icon-name="glyphiconBack"
            :active="backAvailable"
            :on-click="moveBackward"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "../../../../variables.less";
</style>
