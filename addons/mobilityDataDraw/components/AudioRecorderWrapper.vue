<script>
import { mapGetters, mapActions } from "vuex";
import audioRecorderActions from "../store/actions/audioRecorderActions";
import getters from "../store/gettersMobilityDataDraw";
import AudioRecorder from "./AudioRecorder.vue";

export default {
    name: "AudioRecorderWrapper",
    components: {
        AudioRecorder
    },
    mounted() {
        this.initializeAudioRecorder();
    },
    destroyed() {
        this.destroyAudioRecorder();
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters))
    },
    methods: {
        ...mapActions(
            "Tools/MobilityDataDraw",
            Object.keys(audioRecorderActions)
        ),
        onDeleteAudioRecord: function(actionConfirmedCallback){
            const confirmActionSettings = {
                    actionConfirmedCallback,
                    confirmCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deleteRecord.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deleteRecord.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deleteRecord.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deleteRecord.title"
                    ),
                    forceClickToClose: true
                };
                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
        }
    }
};
</script>

<template lang="html">
    <div>
        <div
            v-for="(audioRecord,
            audioRecordIndex) in audioRecords"
            :key="'person_' + audioRecordIndex"
        >
            <div class="audio-recorder-container">
                <AudioRecorder v-bind:audioRecordIndex="audioRecordIndex" />
                <v-btn
                    v-if="
                        audioRecordIndex === audioRecords.length - 1 &&
                            audioRecord.audioRecordBlob
                    "
                    icon
                    :title="
                        $t(
                            'additional:modules.tools.mobilityDataDraw.button.addRecord'
                        )
                    "
                    @click="() => addAudioRecord({})"
                >
                    <v-icon>add_circle</v-icon>
                </v-btn>
                <v-btn
                    v-if="audioRecord.audioRecordBlob"
                    icon
                    :title="
                        $t(
                            'additional:modules.tools.mobilityDataDraw.button.removeRecord'
                        )
                    "
                    @click="() => onDeleteAudioRecord(() => removeAudioRecord(audioRecordIndex))"
                >
                    <v-icon>delete</v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>

.audio-recorder-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

</style>
