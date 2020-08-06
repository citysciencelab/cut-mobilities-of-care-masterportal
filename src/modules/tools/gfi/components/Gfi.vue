<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersGfi";
import Mobile from "./templates/Mobile.vue";
import Detached from "./templates/Detached.vue";

export default {
    name: "Gfi",
    components: {
        Mobile,
        Detached
    },
    data () {
        return {
            pagerIndex: 0
        };
    },
    computed: {
        ...mapGetters({
            isMobile: "mobile",
            desktopType: "gfiDesktopType",
            isTable: "isTableStyle"
        }),
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        ...mapGetters("Map", ["gfiFeatures"]),
        currentViewType: function () {
            if (this.isMobile) {
                return "Mobile";
            }
            return "Detached";
        },
        isVisible: function () {
            return this.gfiFeatures !== null && this.isActive;
        },
        feature: function () {
            return this.gfiFeatures[this.pagerIndex];
        }
    },
    methods: {
        testt: function () {
            console.info(444444555);
        }
    }
};
</script>

<template>
    <div v-if="isVisible">
        <component
            :is="currentViewType"
            :feature="feature"
            @:myevent2="testt"
        />
    </div>
</template>


<style>

</style>
