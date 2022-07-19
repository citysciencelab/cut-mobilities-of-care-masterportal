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
    props: {
        audioRecordId: {
            type: Number,
            default: 0
        }
    },
    mounted() {
        this.initializeAudioRecorder(this.audioRecordId);
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters))
    },
    methods: {
        ...mapActions(
            "Tools/MobilityDataDraw",
            Object.keys(audioRecorderActions)
        ),
        onDeleteAudioRecord: function (actionConfirmedCallback) {
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
        },
        isRecordingToDelete () {
            if (this.audioRecords.length - 1 >= this.audioRecordId) {
                return this.audioRecords[this.audioRecordId].audioRecordBlob;
            }
        },
        isShowRecorder () {
            return (!this.isIosDevice
                || (this.isIosDevice && this.getNumberOfRecordings < 1)
                || (this.isIosDevice && this.getNumberOfRecordings > 0 && this.isRecordingToDelete() !== null));
        }
    }
};
</script>

<template lang="html">
    <div v-if="isShowRecorder()">
        <div>
            <div class="audio-recorder-container">
                <AudioRecorder v-bind:audioRecordIndex="audioRecordId" />
                <v-btn
                    v-if="isRecordingToDelete()"
                    icon
                    :title="
                        $t(
                            'additional:modules.tools.mobilityDataDraw.button.removeRecord'
                        )
                    "
                    @click="() => onDeleteAudioRecord(() => removeAudioRecord(audioRecordId))"
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
