
<script>
import {mapGetters} from "vuex";

import storeModule from "./module";
import {componentMap, mobileHiddenControls} from "./data";

export default {
    name: "Controls",
    computed: {
        ...mapGetters(["controls", "mobile"]),
        activeControls () {
            return this.controls === null
                ? []
                : Object.keys(this.controls)
                    .map(key => componentMap[key]
                        ? {
                            component: componentMap[key],
                            props: typeof this.controls[key] === "object" ? this.controls[key] : {},
                            key
                        }
                        : key)
                    .filter(x => typeof x === "string"
                        ? console.warn(`Control "${x}" not implemented; ignoring key.`)
                        : true);
        }
    },
    mounted () {
        document.getElementById("map").appendChild(this.$el);
    },
    created: function () {
        this.$store.registerModule(["controls"], storeModule);
    },
    methods: {
        /*
        * @param {String} componentName name of the control as noted in config.json
        * @returns {Boolean} true if control should be hidden in mobile screen width
        */
        hiddenMobile (componentName) {
            return mobileHiddenControls.includes(componentName);
        }
    }
};
</script>

<template>
    <div class="ol-unselectable ol-control control-box">
        <template v-for="(control, index) in activeControls">
            <component
                :is="control.component"
                :key="'control-' + control.key"
                :class="[
                    index !== activeControls.length - 1 ? 'spaced' : '',
                    mobile && hiddenMobile(control.key) ? 'hidden' : ''
                ]"
                v-bind="control.props"
            />
        </template>
    </div>
</template>

<style lang="less">
    @import "../../theme.less";

    .control-box {
        .glyphicon {
            color: @color_1;
            background-color: @background_color_1;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
            &:hover {
                cursor: pointer;
                opacity: 0.7;
            }
        }
    }

    .hidden {
        display: none;
    }
</style>

<style lang="less" scoped>
    @import "../../theme.less";

    .control-box {
        right: 0px;
        padding: 5px;
        margin: 5px;
        z-index: 1;

        .spaced {
            margin-bottom: 1em;
        }
    }
</style>
