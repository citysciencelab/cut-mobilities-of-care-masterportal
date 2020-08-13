<script>
import Default from "../themes/Default.vue";
import Schulinfo from "../themes/Schulinfo.vue";
import {upperFirst} from "../../../../../utils/stringHelpers";

export default {
    name: "Detached",
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
    }
};
</script>

<template>
    <div>
        <!-- header -->
        <h1>
            {{ title }}
        </h1>
        <!-- theme -->
        <component
            :is="theme"
            :feature="feature"
        />
        <!-- footer -->
        <slot name="footer" />
    </div>
</template>


<style lang="less">

</style>
