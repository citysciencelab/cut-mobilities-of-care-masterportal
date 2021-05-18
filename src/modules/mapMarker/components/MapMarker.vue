<script>
import {mapActions} from "vuex";

export default {
    name: "MapMarker",
    mounted () {
        this.initialize();

        // The timeout can be removed once the vectorStyle module has moved to Vue.
        setTimeout(() => {
            this.activateByUrlParam();
        }, 500);
    },
    methods: {
        ...mapActions("MapMarker", ["initialize", "activateByUrlParam"])
    }
};

</script>

<template>
    <div class="MapMarker">
        <!-- nothing -->
    </div>
</template>
