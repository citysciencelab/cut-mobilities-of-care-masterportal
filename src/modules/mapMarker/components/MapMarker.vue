<script>
import {mapActions} from "vuex";

export default {
    name: "MapMarker",
    mounted () {
        this.initialize();
    },
    methods: {
        ...mapActions("MapMarker", ["initialize"])
    }
};

</script>

<template>
    <div class="MapMarker">
        <!-- nothing -->
    </div>
</template>
