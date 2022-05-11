<script>
import { mapActions, mapMutations } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "IntroView",
    components: {},
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
         * If terms have been accepted, continue
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
        >
            <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                    Privacy Policy
                </v-card-title>

                <v-card-text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
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
