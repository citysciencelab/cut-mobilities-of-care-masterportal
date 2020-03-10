<script>
import {mapGetters, mapMutations} from "vuex";

export default {
    name: "BackForward",
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
        ...mapGetters("controls/backForward", ["next", "prev"]),
        ...mapGetters("Map", ["map"]),
        /** @returns {boolean} whether a previous memory exists */
        noBack () {
            return this.prev === null;
        },
        /** @returns {boolean} whether a next memory exists */
        noForth () {
            return this.next === null;
        }
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
        this.unsubscribe = this.map.on("moveend", this.memorizeMap);
    },
    beforeDestroy () {
        this.unsubscribe();
    },
    methods: {
        ...mapMutations(
            "controls/backForward",
            ["forward", "backward", "memorize"]
        ),
        memorizeMap () {
            this.memorize(this.map);
        }
    }
};
</script>

<template>
    <div class="back-forward-buttons">
        <span
            :class="['forward', 'glyphicon', glyphiconFor, noForth ? 'inactive' : '']"
            title="Schritt voran"
            @click="forward(map)"
        />
        <span
            :class="['backward', 'glyphicon', glyphiconBack, noBack ? 'inactive' : '']"
            title="Schritt zurück"
            @click="backward(map)"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "../../../theme.less";

    .back-forward-buttons {
        .forward {
            display: block;
        }
        .glyphicon {
            cursor: pointer;
            font-size: 22px;
            padding: 5px 7px 6px 7px;
            margin-top: 4px;
        }
        .inactive {
            pointer-events: none;
            background-color: grey;
        }
    }
</style>
