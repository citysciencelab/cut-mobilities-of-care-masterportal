<script>
import { mapActions, mapMutations } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "PeronalDataOrEnd",
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

        /**
         * Go to personal data input view
         * @returns {void}
         */
        goToPersonalData() {
            this.setView(this.constants.views.PERSONAL_DATA_VIEW);
        },

        /**
         * Skip personal data input
         * @returns {void}
         */
        goToEndView() {
            this.setView(this.constants.views.CLOSING_VIEW);
        }
    }
};
</script>

<template lang="html">
    <div id="tool-mobilityDataDraw-view-closing">
        <h4>
            {{ $t("additional:modules.tools.mobilityDataDraw.personalOrEnd.title") }}
        </h4>

        <p>
            {{
                $t("additional:modules.tools.mobilityDataDraw.personalOrEnd.personalDataChoice")
            }}
        </p>

        <v-btn @click="goToPersonalData">
            {{
                $t("additional:modules.tools.mobilityDataDraw.personalOrEnd.personalDataChoiceButton")
            }}
        </v-btn>

        <p class="second-row-buttons">
            {{
                $t("additional:modules.tools.mobilityDataDraw.personalOrEnd.choseNoPersonalData")
            }}
        </p>

        <v-btn @click="goToEndView">
            {{
                $t("additional:modules.tools.mobilityDataDraw.personalOrEnd.choseNoPersonalDataButton")
            }}
        </v-btn>
    </div>
</template>

<style lang="less" scoped>
#tool-mobilityDataDraw-view-closing {
    > button {
        position: relative !important;
    }
}

.second-row-buttons {
    margin-top: 25px;
}
</style>
