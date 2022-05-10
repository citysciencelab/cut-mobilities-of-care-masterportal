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
            constants: { ...toolConstants, ...sharedConstants }
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
}
</style>
