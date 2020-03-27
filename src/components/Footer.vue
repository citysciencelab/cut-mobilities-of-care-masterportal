<script>
import {mapGetters} from "vuex";
import ScaleLine from "./ScaleLine.vue";

/* TODO implement missing feature toolModelId */

export default {
    name: "Footer",
    components: {
        ScaleLine
    },
    computed: {
        ...mapGetters(["footerConfig", "mobile", "masterPortalVersionNumber"]),
        urls () {
            return this.footerConfig?.urls;
        },
        showVersion () {
            return this.footerConfig?.showVersion;
        }
    }
};
</script>

<template>
    <div id="footer">
        <template v-for="(url, index) in urls">
            <span
                :key="`footer-url-${index}`"
            >
                {{ url.bezeichnung }}
                <a
                    :href="url.url"
                    target="_blank"
                >
                    {{ mobile ? url.alias_mobil : url.alias }}
                </a>
                <span class="glyphicon glyphicon-option-vertical hidden-xs" />
            </span>
        </template>
        <template v-if="showVersion">
            <span class="hidden-xs">
                Version: {{ masterPortalVersionNumber }}
            </span>
            <span class="glyphicon glyphicon-option-vertical hidden-xs" />
        </template>
        <ScaleLine />
    </div>
</template>

<style lang="less" scoped>
    @import "../variables.less";

    #footer {
        width: 100%;

        background: rgba(255,255,255,0.7);

        font-family: @font_family_0_b;
        color: @color_1_dark;
        box-shadow: 0px -6px 12px rgba(0, 0, 0, 0.176);
        font-size: 10px;
        padding: 4px 10px;

        z-index: 0; /* TODO get rid of this - why is it even necessary? */

        .glyphicon-option-vertical {
            padding: 0 8px;
            font-size: 12px;
        }
    }
</style>
