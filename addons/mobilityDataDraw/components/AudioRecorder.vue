<script>
import { mapGetters, mapActions } from "vuex";
import * as toolConstants from "../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../shared/constants/mobilityData";
import audioRecorderActions from "../store/actions/audioRecorderActions";
import getters from "../store/gettersMobilityDataDraw";

export default {
    name: "AudioRecorder",
    components: {},
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants }
        };
    },
    props: {
        audioRecordIndex: {
            type: Number,
            default: 0
        }
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),
        /**
         * Current audio record
         */
        audioRecord() {
            return this.audioRecords[this.audioRecordIndex];
        },
        /**
         * The URL for the audio record
         */
        audioRecordUrl() {
            const audioRecord = this.audioRecords[this.audioRecordIndex];
            return audioRecord.audioRecordBlob
                ? URL.createObjectURL(audioRecord.audioRecordBlob)
                : "";
        }
    },
    methods: {
        ...mapActions(
            "Tools/MobilityDataDraw",
            Object.keys(audioRecorderActions)
        )
    }
};
</script>

<template lang="html">
    <div id="mobility-data-audio-recorder">
        <v-btn
            v-if="!audioRecord.isRecording"
            :disabled="
                !audioRecorder ||
                    currentInteraction === constants.interactionTypes.MODIFY
            "
            :src="audioRecord"
            @click="() => startRecording(this.audioRecordIndex)"
            icon
        >
            <v-icon>mic</v-icon>
        </v-btn>
        <v-btn
            v-else
            class="is-recording"
            :disabled="
                !audioRecorder ||
                    currentInteraction === constants.interactionTypes.MODIFY
            "
            @click="() => stopRecording(this.audioRecordIndex)"
            icon
        >
            <v-icon>stop</v-icon>
        </v-btn>

        <audio v-if="audioRecordUrl" :src="audioRecordUrl" controls></audio>
    </div>
</template>

<style lang="less" scoped>
#mobility-data-audio-recorder {
    display: grid;
    grid-template-columns: 40px auto;
    grid-gap: 10px;
    height: 40px;

    button {
        position: relative;
        width: 40px;
        height: 40px;
        padding: 0;
        border-radius: 50%;

        &[disabled] {
            color: #969696;
        }

        &.is-recording {
            color: #fff;

            &::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(225, 0, 25, 1);
                box-shadow: 0 0 0 0 rgba(225, 0, 25, 1);
                animation: audio-recording-pulse 2s infinite;
                opacity: 1;
            }
        }

        &::v-deep .v-icon {
            color: currentColor;
        }
    }

    audio {
        max-width: 100%;
        height: 40px;

        &::-webkit-media-controls-panel {
            background: #e3e3e3;
        }
    }
}

@keyframes audio-recording-pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(225, 0, 25, 0.7);
    }

    70% {
        transform: scale(1.1);
        box-shadow: 0 0 0 5px rgba(225, 0, 25, 0);
    }

    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(225, 0, 25, 0);
    }
}
</style>
