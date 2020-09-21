<script>
import Default from "../themes/Default.vue";
import Schulinfo from "../themes/Schulinfo.vue";
import Solaratlas from "../themes/Solaratlas.vue";
import TrafficCount from "../themes/trafficCount/components/TrafficCount.vue";
import {upperFirst} from "../../../../../utils/stringHelpers";

export default {
    name: "Mobile",
    components: {
        Default,
        Schulinfo,
        Solaratlas,
        TrafficCount
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        /**
         * Returns the title of the gfi.
         * @returns {string} the title
         */
        title: function () {
            return this.feature.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {string} the name of the theme
         */
        theme: function () {
            return this.getTheme();
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.showMobileComponent();
        });
    },
    methods: {
        close () {
            this.$emit("close");
        },
        closeByClickOutside: function (event) {
            // stop event bubbling
            if (event.target !== this.$el) {
                return;
            }
            this.close();
        },

        /**
         * it will show this mobile component if it is switched from attached theme.
         * the method is to fore to insert this component into parent gfi element.
         * @returns {void}
         */
        showMobileComponent: function () {
            if (!document.getElementsByClassName("modal-dialog").length && document.getElementsByClassName("gfi").length) {
                document.getElementsByClassName("gfi")[0].appendChild(this.$el);
            }
        },

        /**
         * Returns the right gfi Theme
         * it check if the right Theme (Component) is there, if yes just use this component, otherwise use the default theme
         * @returns {String} the name of the gfi Theme
         */
        getTheme () {
            const gfiComponents = Object.keys(this.$options.components),
                configTheme = upperFirst(this.feature.getTheme());

            let theme = "";

            if (gfiComponents && Array.isArray(gfiComponents) && gfiComponents.length && gfiComponents.includes(configTheme)) {
                theme = configTheme;
            }
            else {
                console.warn(String("The gfi theme '" + configTheme + "' could not be found, the default theme will be used. Please check your configuration!"));
                theme = "Default";
            }

            return theme;
        }
    }
};
</script>

<template>
    <div
        class="modal-mask"
        @click="closeByClickOutside"
    >
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button
                        type="button"
                        class="close"
                        aria-label="Close"
                        @click="close"
                    >
                        <span
                            class="glyphicon glyphicon-remove"
                        >
                        </span>
                    </button>
                    <h5 class="modal-title">
                        {{ title }}
                    </h5>
                </div>
                <div class="modal-body">
                    <component
                        :is="theme"
                        :feature="feature"
                    />
                </div>
                <div class="modal-footer">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </div>
</template>


<style lang="less" scoped>
@import "~variables";

.modal-mask {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: @shadow_overlay;
}

.modal-header {
    padding: 0 15px;
    button {
        font-size: 16px;
        padding-top: 13px;
        opacity: 0.6;
    }
    .modal-title {
        margin: 10px 0;
    }
}

.modal-body {
    overflow-y: auto;
    max-height: 66vh;
    padding: 0;
    table {
        margin-bottom: 0;
    }
}

.modal-footer {
    padding: 0;
    font-size: 22px;
}

</style>
