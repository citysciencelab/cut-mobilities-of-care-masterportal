
<script>
import {mapGetters} from "vuex";

export default {
    name: "Controls",
    computed: {
        ...mapGetters(["controlsConfig", "mobile"]),
        ...mapGetters("controls", ["componentMap", "mobileHiddenControls", "bottomControlsLeft", "bottomControlsRight"]),
        categorizedControls () {
            if (this.controlsConfig === null) {
                return [];
            }

            const categorizedControls = {
                main: [],
                bottomLeft: [],
                bottomRight: []
            };

            Object
                .keys(this.controlsConfig)
                .map(key => {
                    if (this.componentMap[key]) {
                        return {
                            component: this.componentMap[key],
                            props: typeof this.controlsConfig[key] === "object" ? this.controlsConfig[key] : {},
                            key
                        };
                    }
                    return key;
                })
                .filter(x => typeof x === "string" ? console.warn(`Control "${x}" not implemented; ignoring key.`) : true)
                .forEach(c => {
                    if (this.bottomControlsLeft.includes(c.key)) {
                        categorizedControls.bottomLeft.push(c);
                    }
                    else if (this.bottomControlsRight.includes(c.key)) {
                        categorizedControls.bottomRight.push(c);
                    }
                    else {
                        categorizedControls.main.push(c);
                    }
                });

            return categorizedControls;
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
    <div class="right-bar">
        <div class="main-elements">
            test
            <template v-for="(control, index) in categorizedControls.main">
                <component
                    :is="control.component"
                    :key="'control-' + control.key"
                    :class="[
                        index !== categorizedControls.main.length - 1 ? 'spaced' : '',
                        mobile && hiddenMobile(control.key) ? 'hidden' : ''
                    ]"
                    v-bind="control.props"
                />
            </template>
        </div>
        <div class="low-elements">
            test
            <template v-for="(control, index) in categorizedControls.bottomRight">
                <component
                    :is="control.component"
                    :key="'control-' + control.key"
                    :class="[
                        index !== categorizedControls.bottomRight.length - 1 ? 'spaced' : '',
                        mobile && hiddenMobile(control.key) ? 'hidden' : ''
                    ]"
                    v-bind="control.props"
                />
            </template>
        </div>
        <div class="left-bar">
            test
            <template v-for="(control, index) in categorizedControls.bottomLeft">
                <component
                    :is="control.component"
                    :key="'control-' + control.key"
                    :class="[
                        index !== categorizedControls.bottomLeft.length - 1 ? 'spaced' : '',
                        mobile && hiddenMobile(control.key) ? 'hidden' : ''
                    ]"
                    v-bind="control.props"
                />
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import "../../theme.less";

    .hidden {
        display: none;
    }

    .right-bar {
        pointer-events: none;
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: calc(100% - 35px);
        max-height: calc(100% - 35px);
        /* Issue: While this does scroll, it will also hide the attributions flyout */
        /* overflow-y: scroll; */

        right: 0px;
        padding: 5px;
        margin: 5px;
        z-index: 1;

        .spaced {
            margin-bottom: 1em;
        }

        .main-elements, .low-elements {
            pointer-events: all;
        }
    }

    .left-bar {
        position: fixed;
        pointer-events: all;
        left: 0px;
        bottom: 20px;
        z-index: 1;
    }
</style>
