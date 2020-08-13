<script>
import Default from "../themes/Default.vue";
import Schulinfo from "../themes/Schulinfo.vue";
import {upperFirst} from "../../../../../utils/stringHelpers";

export default {
    name: "Mobile",
    components: {
        Default,
        Schulinfo
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
         * It only works if the theme has the same name as the theme component.
         * @returns {string} the name of the theme
         */
        theme: function () {
            return upperFirst(this.feature.getTheme());
        }
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
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title">
                        {{ title }}
                    </h4>
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

.modal-header button {
    font-size: 26px;
}

.modal-body {
    overflow-y: auto;
    max-height: 66vh;
    padding: 0;
}

.modal-footer {
    padding: 0;
    font-size: 22px;
}

</style>
