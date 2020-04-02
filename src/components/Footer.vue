<script>
import {mapGetters} from "vuex";
import ScaleLine from "./ScaleLine.vue";
import MousePosition from "./controls/MousePosition.vue";

/* TODO implement missing feature toolModelId */

export default {
    name: "Footer",
    components: {
        ScaleLine,
        MousePosition
    },
    computed: {
        ...mapGetters(["footerConfig", "mobile", "masterPortalVersionNumber"]),
        showFooter () {
            return Boolean(this.footerConfig);
        },
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
    <div
        id="footer"
        :class="!showFooter && 'hide-footer'"
    >
        <MousePosition class="footer-mouse-position" />
        <!-- keep div#footer as anchor for mouse position even if no footer is to be rendered -->
        <template v-if="showFooter">
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
                    <span class="glyphicon glyphicon-option-vertical hidden-xs" />
                </span>
            </template>
            <span class="spacer" />
            <ScaleLine />
            <!-- TODO put LanguageSwitcher here (currently worked on in another branch) -->
        </template>
    </div>
</template>

<style lang="less" scoped>
    @import "../variables.less";

    #footer {
        width: 100%;

        background: fade(@secondary, 70%);

        font-family: @font_family_narrow;
        color: @secondary_contrast;
        font-size: @font_size_tiny;

        box-shadow: 0px -6px 12px @shadow;
        padding: 4px 10px;

        z-index: 0; /* TODO get rid of this - why is it even necessary? */

        display: flex;
        position: relative;

        &.hide-footer {
            padding: 0;
        }

        .spacer {
            flex-grow: 1;
        }

        .glyphicon-option-vertical {
            padding: 0 8px;
            font-size: 12px;
        }

        .footer-mouse-position {
            position: absolute;
            left: 0;
            bottom: 100%;
            /* should share bottom-line last control element */
            margin-bottom: 15px;
        }
    }
</style>
