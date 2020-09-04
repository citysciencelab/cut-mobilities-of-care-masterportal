<script>

import {mapGetters} from "vuex";
import {mapActions} from "vuex";

export default {
    name: "RemoteInterface",

    data: function () {
        return {};
    },

    computed: {
        ...mapGetters("RemoteInterface", [
            "postMessageUrl"
        ]),
        console: () => console
    },

    watch: {},

    created: function () {
        this.initialize();
    },

    mounted: function () {
        if (this.postMessageUrl) {
            console.log("addEventListener");
            
            window.addEventListener("message", this.processMessage);
        }
    },

    methods: {
        ...mapActions("RemoteInterface", [
            "initialize",
            "processMessage"    
        ]),
    }
};
</script>

<template>
    <div>HALLO!</div>
</template>