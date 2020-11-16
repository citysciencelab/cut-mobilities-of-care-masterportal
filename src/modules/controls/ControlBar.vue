<script>
import {mapGetters} from "vuex";
import ControlBarBackwardsCompatibility from "./ControlBarBackwardsCompatibility.vue";

const fallbackTopRight = {
        component: ControlBarBackwardsCompatibility,
        props: {id: "top-right-fallback"},
        key: "top-right-fallback"
    },
    fallbackBottomRight = {
        component: ControlBarBackwardsCompatibility,
        props: {id: "bottom-right-fallback"},
        key: "bottom-right-fallback"
    };

/* TODO
 * This was the planned concept:
 * 1. scrollable if too many controls are included within
 * 2. open-/closable on mobile resolution, that is: only x (per default 3) control
 * controls are to be shown, and the rest can be opened/closed via a button
 * (think: openable toolbox); when open and place is not sufficient, the bar
 * is to be scrollable again
 *
 * However, positioning is currently in discussion, and a separate ticket
 * was made regarding the creation of a control concept. Stopping above implementation
 * in favour of stability until concept is ready.
 */

/**
 * Control layout component that places controls on the map.
 */
export default {
    name: "ControlBar",
    data () {
        return {
            categories: [
                {categoryName: "top", className: "top-controls"},
                {categoryName: "bottom", className: "bottom-controls"}
            ]
        };
    },
    computed: {
        ...mapGetters(["controlsConfig", "mobile", "isSimpleStyle"]),
        ...mapGetters("controls", ["componentMap", "mobileHiddenControls", "bottomControls"]),
        /** @returns {Object} contains controls to-be-rendered sorted by placement */
        categorizedControls () {
            const categorizedControls = {
                top: [],
                bottom: []
            };

            if (this.controlsConfig === null) {
                return {
                    top: [fallbackTopRight],
                    bottom: [fallbackBottomRight]
                };
            }

            Object
                .keys(this.controlsConfig)
                .filter(key => this.controlsConfig[key])
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
                .filter(x => x !== "mousePosition") // "mousePosition" is currently handled in footer
                .forEach(c => {
                    if (this.bottomControls.includes(c.key)) {
                        categorizedControls.bottom.push(c);
                    }
                    else {
                        // defaulting to top-right corner
                        categorizedControls.top.push(c);
                    }
                });

            categorizedControls.top.push(fallbackTopRight);
            categorizedControls.bottom.unshift(fallbackBottomRight);

            return categorizedControls;
        }
    },
    methods: {
        /**
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
        <template v-if="!isSimpleStyle">
            <div
                v-for="{categoryName, className} in categories"
                :key="className"
                :class="className"
            >
                <template v-for="(control, index) in categorizedControls[categoryName]">
                    <component
                        :is="control.component"
                        :key="'control-' + control.key"
                        :class="[
                            index !== categorizedControls[categoryName].length - 1 ? 'spaced' : '',
                            mobile && hiddenMobile(control.key) ? 'hidden' : ''
                        ]"
                        v-bind="control.props"
                    />
                </template>
            </div>
        </template>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .hidden {
        display: none;
    }

    .spaced {
        margin-bottom: 1em;
    }

    .right-bar {
        pointer-events: none;

        display: flex;
        flex-direction: column;
        justify-content: space-between;

        padding: 5px;
        margin: 5px 5px 12px 5px;

        .top-controls, .bottom-controls {
            pointer-events: all;
        }
    }
</style>
