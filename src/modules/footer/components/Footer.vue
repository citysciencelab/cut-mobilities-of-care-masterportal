<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFooter";
import mutations from "../store/mutationsFooter";
import ScaleLine from "../../scaleLine/components/ScaleLine.vue";
import Language from "../../language/components/Language.vue";
import MousePosition from "../../controls/mousePosition/components/MousePosition.vue";

/**
 * Footer that is displayed below the map. The version of the masterportal and links can be displayed here.
 */
export default {
    name: "Footer",
    components: {
        Language,
        ScaleLine,
        MousePosition
    },
    computed: {
        ...mapGetters(["footerConfig", "mobile", "masterPortalVersionNumber"]),
        ...mapGetters("Footer", Object.keys(getters)),
        showLanguageSwitcher () {
            return this.$i18n.i18next.options.isEnabled() && Object.keys(this.$i18n.i18next.options.getLanguages()).length > 1;
        }
    },
    mounted () {
        this.initialize();

        if (this.footerConfig) {
            this.setShowFooter(true);
        }
    },
    methods: {
        ...mapActions("Footer", [
            "initialize"
        ]),
        ...mapMutations("Footer", Object.keys(mutations)),

        /**
         * Toggles the given Tool
         * @param {string} toolModelId The Model ID of the tool to activate/deactivate. ID may be empty.
         * @param {object} event The Click event
         * @returns {void}
         */
        toggleTool (toolModelId, event) {
            if (toolModelId) {
                const model = Radio.request("ModelList", "getModelByAttributes", {id: toolModelId});

                if (model) {
                    if (event) {
                        event.preventDefault();
                    }

                    model.setIsActive(!model.isActive);
                }
            }
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
                    {{ $t(url.bezeichnung) }}
                    <a
                        :href="url.url"
                        target="_blank"
                        @click="toggleTool(url.toolModelId, $event)"
                    >
                        {{ $t(mobile ? $t(url.alias_mobil) : $t(url.alias)) }}
                    </a>
                    <span
                        v-if="index < Object.keys(urls).length - 1 || showVersion"
                        class="glyphicon glyphicon-option-vertical hidden-xs"
                    />
                </span>
            </template>
            <template v-if="showVersion">
                <span class="hidden-xs">
                    {{ $t("masterPortalVersion", {masterPortalVersionNumber}) }}
                </span>
            </template>
            <span class="spacer" />
            <ScaleLine />
            <Language v-if="showLanguageSwitcher" />
        </template>
        <ScaleLine
            v-else
            class="footer-scaleLine"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    #footer {
        width: 100%;

        background: fade(@secondary, 70%);

        font-family: @font_family_narrow;
        color: @secondary_contrast;
        font-size: @font_size_tiny;

        box-shadow: 0px -6px 12px @shadow;
        padding: 4px 10px;

        z-index: 2;

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
        }

        .footer-mouse-position {
            position: absolute;
            left: 0;
            bottom: 100%;
            /* should share bottom-line last control element */
            margin-bottom: 15px;
        }

        .footer-scaleLine {
            position: absolute;
            right: 0;
            bottom: 100%;
        }
    }
</style>
