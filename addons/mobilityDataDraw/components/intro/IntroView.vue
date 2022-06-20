<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import DataPolicyDE from "./DataPolicyDE.vue";
import DataPolicyEN from "./DataPolicyEN.vue";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";

export default {
    name: "IntroView",
    components: {
        DataPolicyDE,
        DataPolicyEN
    },
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants },
            termsAccepted: false,
            showDialog: false,
            lang: i18next.language
        };
    },
    computed: {},
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", ["setView"]),
        ...mapActions("Tools/MobilityDataDraw", ["resetDrawnData"]),
        ...mapMutations("Language", ["setCurrentLocale"]),
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),

        /**
         * Switch language
         * @returns {void}
         */
        switchLanguage() {
            const language = i18next.language === 'en' ? 'de' : 'en'
            i18next.changeLanguage(language, () => {
                this.setCurrentLocale(language);
            });
        },
        /**
         * If terms have been accepted, continue
         * @returns {void}
         */
        startDrawing() {
            this.setView(this.constants.views.ANNOTATIONS_VIEW);
        },
        /**
         * Determine current language
         * @returns {void}
         */
        getLanguage() {
            return i18next.language;
        }
    }
};
</script>

<template lang="html">
    <div id="tool-mobilityDataDraw-view-intro">
        <h4>
            {{ $t("additional:modules.tools.mobilityDataDraw.intro.greeting") }}
        </h4>

        <p class="intro-text">
            {{
                $t("additional:modules.tools.mobilityDataDraw.intro.message")
            }}
        </p>

        <v-btn @click="switchLanguage">
            {{
                $t("additional:modules.tools.mobilityDataDraw.intro.language")
            }}
        </v-btn>
        <div class="terms-holder">
            <v-checkbox
                v-model="termsAccepted"
            ></v-checkbox>
            <div v-if="getLanguage() === 'de'">
                <a href="javascript:void(0);" v-on:click="showDialog = !showDialog">{{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms1') }}</a>
            {{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms2') }}
            </div>
            <div v-else>
                {{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms1') }}
                <a href="javascript:void(0);" v-on:click="showDialog = !showDialog">{{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms2') }}</a>
            </div>
        </div>

        <v-btn
            @click="startDrawing"
            :disabled="!termsAccepted"
        >
            {{
                $t("additional:modules.tools.mobilityDataDraw.intro.startTool")
            }}
        </v-btn>

        <v-dialog
            v-model="showDialog"
            transition="dialog-top-transition"
            max-width="600"
            :fullscreen="isCurrentMobile()"
        >
            <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.intro.privacyPolicy"
                        )
                    }}
                </v-card-title>

                <v-card-text class="data-policy-holder">
                    <DataPolicyDE v-if="getLanguage() === 'de'" />
                    <DataPolicyEN v-if="getLanguage() === 'en'" />
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="termsAccepted = !termsAccepted; showDialog = false"
                    >
                        I accept
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<style lang="less">
    .data-policy-holder {
        max-height: 450px;
        overflow-y: auto;
    }

    @media only screen and (max-height: 460px) {
        max-height: 300px;
    }
</style>

<style lang="less" scoped>
#tool-mobilityDataDraw-view-intro {
    > button {
        position: relative !important;
    }
    .intro-text {
        overflow-wrap: normal;
        max-width: 350px;
        padding-left: 5px;
    }
    .terms-holder {
        display: flex;
        div {
            margin-top: 22px;
            font-size: 11pt;
            padding-top: 8px;
        }
    }
}
</style>
