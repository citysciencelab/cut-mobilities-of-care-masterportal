
<script>
import {mapGetters} from "vuex";

export default {
    name: "Controls",
    computed: {
        ...mapGetters(["controls", "mobile"]),
        ...mapGetters("controls", ["componentMap", "mobileHiddenControls", "bottomControls"]),
        activeControls () {
            return this.controls === null
                ? []
                : Object.keys(this.controls)
                    .map(key => this.componentMap[key]
                        ? {
                            component: this.componentMap[key],
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
    methods: {
        /*
        * @param {String} componentName name of the control as noted in config.json
        * @returns {Boolean} true if control should be hidden in mobile screen width
        */
        hiddenMobile (componentName) {
            return this.mobileHiddenControls.includes(componentName);
        }
    }
};
</script>

<template>
    <div class="ol-unselectable ol-control control-box">
        <!-- TODO Issue: While this mostly works, it's duplicated code and the .spaced is mis-applied; fix -->
        <template v-for="(control, index) in activeControls">
            <component
                :is="control.component"
                v-if="!bottomControls.includes(control.key)"
                :key="'control-' + control.key"
                :class="[
                    index !== activeControls.length - 1 ? 'spaced' : '',
                    mobile && hiddenMobile(control.key) ? 'hidden' : ''
                ]"
                v-bind="control.props"
            />
        </template>
        <div class="spacer" />
        <template v-for="(control, index) in activeControls">
            <component
                :is="control.component"
                v-if="bottomControls.includes(control.key)"
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
        display: flex;
        flex-direction: column;
        height: calc(100% - 35px);
        max-height: calc(100% - 35px);
        /* Issue: While this does scroll, it will also hide the attributions flyout */
        /* overflow-y: scroll; */

        right: 0px;
        padding: 5px;
        margin: 5px;
        z-index: 1;

        .spacer {
            flex-grow: 1;
        }

        .spaced {
            margin-bottom: 1em;
        }
    }
</style>
