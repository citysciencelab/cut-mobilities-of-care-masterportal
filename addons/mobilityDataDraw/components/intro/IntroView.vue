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

        /**
         * Resets the drawn data and goes back to the daily routine drawing view
         * @returns {void}
         */
        restartDrawing() {
            this.resetDrawnData();
            this.setView(this.constants.views.INTRO_VIEW);
        }
    }
};
</script>

<template lang="html">
    <div id="tool-mobilityDataDraw-view-intro">
        ascsacascsacascsac
        ascsacascsacascsac
        ascsacascsacascsac
        ascsacascsacascsac
        <h4>
            {{ $t("additional:modules.tools.mobilityDataDraw.intro.greeting") }}
        </h4>

        <p>
            {{
                $t("additional:modules.tools.mobilityDataDraw.intro.message")
            }}
        </p>

        <v-btn @click="restartDrawing">
            {{
                $t("additional:modules.tools.mobilityDataDraw.button.enterMore")
            }}
        </v-btn>
        <v-btn @click="$emit('close')">
            {{ $t("additional:modules.tools.mobilityDataDraw.button.finish") }}
        </v-btn>
    </div>
</template>

<style lang="less" scoped>
#tool-mobilityDataDraw-view-intro {
    > button {
        position: relative !important;
    }
}
</style>
