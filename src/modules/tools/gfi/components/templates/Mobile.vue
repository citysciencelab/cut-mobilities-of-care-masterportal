<script>
import Default from "../themes/default/components/Default.vue";
import Sensor from "../themes/sensor/components/Sensor.vue";
import upperFirst from "../../../../../utils/upperFirst";

export default {
    name: "Mobile",
    components: {
        Default,
        Sensor
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
         * @returns {String} the title
         */
        title: function () {
            return this.feature.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
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
                gfiTheme = this.feature.getTheme(),
                configTheme = upperFirst(typeof gfiTheme === "object" ? gfiTheme.name : gfiTheme);

            let theme = "";

            if (gfiComponents && Array.isArray(gfiComponents) && gfiComponents.length && gfiComponents.includes(configTheme)) {
                theme = configTheme;
            }
            else if (this.$themeAddons && this.$themeAddons.includes(configTheme)) { // handling of addon-themes
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
