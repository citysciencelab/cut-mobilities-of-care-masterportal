<script>
import {mapGetters, mapActions} from "vuex";

export default {
    name: "MapMarker",
    computed: {
        ...mapGetters("MapMarker", ["urlParameter"])
    },
    /**
     * The watcher can be replaced by calling the action activateByUrlParamin the mounted hook
     * once the vectorStyling has moved to Vue
     */
    watch: {
        urlParameter (value) {
            this.placingPointMarker(value);
        }
    },
    mounted () {
        this.initialize();
        // this.activateByUrlParam();
    },
    methods: {
        ...mapActions("MapMarker", ["initialize", "activateByUrlParam", "placingPointMarker"])
    }
};

</script>

<template>
    <div class="MapMarker">
        <!-- nothing -->
    </div>
</template>
