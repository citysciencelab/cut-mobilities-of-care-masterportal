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
            scrollable="true"
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

                <v-card-actions class="custom-action">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="termsAccepted = !termsAccepted; showDialog = false"
                    >
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.intro.accept"
                            )
                        }}
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

<style lang="less">
    .data-policy-holder {
        max-height: 450px;
        overflow-y: auto;
    }

    @media only screen and (max-height: 460px) {
        max-height: 300px;

        .v-card__title {
            height: 43px !important;
            padding-top: 8px !important;
            margin-bottom: 3px !important;
        }

        .v-card__text {
            padding: 10px !important;
        }

        .v-dialog>.v-card>.v-card__actions {
            border-top: 1px solid #e0e0e0 !important;
            height: 40px !important;
            margin-top: 3px !important;
        }
    }

    // CSS created from pdf to css - not well formatted
    .data-policy-text {
        @media only screen and (max-height: 460px) {
            * {
                padding-left: 0 !important;
                text-indent: 0 !important;
            }

            p.s3 {
                padding-left: 5px !important;
            }

            h3 {
                line-height: inherit !important;
            }
        }

        * {
            margin: 0;
            padding: 0;
            text-indent: 0;
        }

        h1 {
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            text-decoration: none;
            font-size: 14pt;
        }

        .s1 {
            color: black;
            font-family: Calibri, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        h2 {
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            text-decoration: none;
            font-size: 13pt;
        }

        .p, p {
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
            margin: 0pt;
        }

        .s2 {
            color: black;
            font-family: Arial, sans-serif;
            font-style: italic;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        a {
            color: black;
            font-family: Arial, sans-serif;
            font-style: italic;
            font-weight: normal;
            text-decoration: underline;
            font-size: 12pt;
        }

        h3 {
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            text-decoration: none;
            font-size: 12pt;
        }

        .s3 {
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 11pt;
            padding-left: 40pt !important;
        }

        h4 .s3 {
            padding-left: 0 !important;
            display: block;
        }

        h4 {
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            text-decoration: none;
            font-size: 11pt;
        }

        .s4 {
            color: black;
            font-family: "Times New Roman", serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        .s5 {
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        .s6 {
            color: #2F5496;
            font-family: Arial, sans-serif;
            font-style: italic;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        li {
            display: block;
        }

        #l1 {
            padding-left: 0pt;
            counter-reset: c1 1;
        }

        #l1 > li > *:first-child:before {
            counter-increment: c1;
            content: counter(c1, upper-roman) ". ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            text-decoration: none;
            font-size: 13pt;
        }

        #l1 > li:first-child > *:first-child:before {
            counter-increment: c1 0;
        }

        #l2 {
            padding-left: 0pt;
            counter-reset: c2 1;
        }

        #l2 > li > *:first-child:before {
            counter-increment: c2;
            content: counter(c2, decimal) ". ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            text-decoration: none;
            font-size: 12pt;
        }

        #l2 > li:first-child > *:first-child:before {
            counter-increment: c2 0;
        }

        #l3 {
            padding-left: 0pt;
        }

        #l3 > li > *:first-child:before {
            content: " ";
            color: black;
            font-family: Symbol, serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 10pt;
        }

        #l4 {
            padding-left: 0pt;
        }

        #l4 > li > *:first-child:before {
            content: " ";
            color: black;
            font-family: Symbol, serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 11pt;
        }

        #l5 {
            padding-left: 0pt;
        }

        #l5 > li > *:first-child:before {
            content: " ";
            color: black;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-family: Symbol, serif;
        }

        #l6 {
            padding-left: 0pt;
        }

        #l6 > li > *:first-child:before {
            content: " ";
            color: black;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-family: Symbol, serif;
        }

        #l7 {
            padding-left: 0pt;
        }

        #l7 > li > *:first-child:before {
            content: " ";
            color: black;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-family: Symbol, serif;
        }

        li {
            display: block;
        }

        #l8 {
            padding-left: 0pt;
            counter-reset: e1 4;
        }

        #l8 > li > *:first-child:before {
            counter-increment: e1;
            content: counter(e1, decimal) ". ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            text-decoration: none;
            font-size: 12pt;
        }

        #l8 > li:first-child > *:first-child:before {
            counter-increment: e1 0;
        }

        #l9 {
            padding-left: 0pt;
            counter-reset: f1 1;
        }

        #l9 > li > *:first-child:before {
            counter-increment: f1;
            content: "(" counter(f1, decimal) ") ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        #l9 > li:first-child > *:first-child:before {
            counter-increment: f1 0;
        }

        #l10 {
            padding-left: 0pt;
            counter-reset: g1 1;
        }

        #l10 > li > *:first-child:before {
            counter-increment: g1;
            content: "(" counter(g1, decimal) ") ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        #l10 > li:first-child > *:first-child:before {
            counter-increment: g1 0;
        }

        #l11 {
            padding-left: 0pt;
            counter-reset: h1 1;
        }

        #l11 > li > *:first-child:before {
            counter-increment: h1;
            content: counter(h1, lower-latin) ") ";
            color: #2F5496;
            font-family: Arial, sans-serif;
            font-style: italic;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        #l11 > li:first-child > *:first-child:before {
            counter-increment: h1 0;
        }

        #l12 {
            padding-left: 0pt;
            counter-reset: i1 1;
        }

        #l12 > li > *:first-child:before {
            counter-increment: i1;
            content: "(" counter(i1, decimal) ") ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        #l12 > li:first-child > *:first-child:before {
            counter-increment: i1 0;
        }

        #l13 {
            padding-left: 0pt;
            counter-reset: j1 1;
        }

        #l13 > li > *:first-child:before {
            counter-increment: j1;
            content: "(" counter(j1, decimal) ") ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        #l13 > li:first-child > *:first-child:before {
            counter-increment: j1 0;
        }

        #l14 {
            padding-left: 0pt;
            counter-reset: k1 1;
        }

        #l14 > li > *:first-child:before {
            counter-increment: k1;
            content: "(" counter(k1, decimal) ") ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        #l14 > li:first-child > *:first-child:before {
            counter-increment: k1 0;
        }

        #l15 {
            padding-left: 0pt;
            counter-reset: l1 1;
        }

        #l15 > li > *:first-child:before {
            counter-increment: l1;
            content: "(" counter(l1, decimal) ") ";
            color: black;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            text-decoration: none;
            font-size: 12pt;
        }

        #l15 > li:first-child > *:first-child:before {
            counter-increment: l1 0;
        }
    }
</style>

