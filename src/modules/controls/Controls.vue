
<script>
import {mapGetters} from "vuex";

export default {
    name: "Controls",
    computed: {
        ...mapGetters(["controlsConfig", "mobile"]),
        ...mapGetters("controls", ["componentMap", "mobileHiddenControls"]),
        activeControls () {
            if (this.controlsConfig === null) {
                return [];
            }

            return Object.keys(this.controlsConfig)
                .map(key => {
                    if (this.componentMap[key]) {
                        return {
                            component: this.componentMap[key],
                            props: typeof this.controlsConfig[key] === "object" ? this.controlsConfig[key] : {},
                            key
                        };
                    }
                    return key;
                }).filter(x => typeof x === "string" ? console.warn(`Control "${x}" not implemented; ignoring key.`) : true);
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
    @import "~variables";

    .control-box {
        .glyphicon {
            color: @primary_contrast;
            background-color: @primary;
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
    @import "~variables";

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
