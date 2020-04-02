
<script>
import {mapGetters} from "vuex";

/**
 * TODO the "main" control bar element is supposed to be
 * 1. scrollable if too many elements are included within
 * 2. open-/closable on mobile resolution, that is: only x (per default 3) control
 * elements are to be shown, and the rest can be opened/closed via a button
 * (think: openable toolbox); when open and place is not sufficient, the bar
 * is to be scrollable again
 */
export default {
    name: "ControlBar",
    data () {
        return {
            categories: [
                {categoryName: "main", className: "main-elements"},
                {categoryName: "bottom", className: "low-elements"}
            ]
        };
    },
    computed: {
        ...mapGetters(["controlsConfig", "mobile"]),
        ...mapGetters("controls", ["componentMap", "mobileHiddenControls", "bottomControls"]),
        categorizedControls () {
            if (this.controlsConfig === null) {
                return [];
            }

            const categorizedControls = {
                main: [],
                bottom: []
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
                    if (this.bottomControls.includes(c.key)) {
                        categorizedControls.bottom.push(c);
                    }
                    else {
                        categorizedControls.main.push(c);
                    }
                });

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
    </div>
</template>

<style lang="less" scoped>
    @import "../../variables.less";

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
        margin: 5px;

        .main-elements, .low-elements {
            pointer-events: all;
        }
    }
</style>
