<script>
import { mapGetters, mapActions } from "vuex";
import * as toolConstants from "../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../shared/constants/mobilityData";
import getters from "../store/gettersMobilityDataDraw";
import actions from "../store/actionsMobilityDataDraw";

export default {
    name: "ImageUploader",
    components: {},
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants },
            chosenFile: null,
        };
    },
    props: {
        imageUploadIndex: {
            type: Number,
            default: 0
        }
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),
    },
    methods: {
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),
        /**
         * Current image upload
         */
        saveUploadedIMage(files) {
            if (this.chosenFile) {
                this.addImageUpload(this.chosenFile);
            }
        }
    }
};
</script>

<template lang="html">
    <div id="file_upload_holder">
        <v-icon class="camera_icon">
            camera_alt
        </v-icon>
        <v-file-input
            v-model="chosenFile"
            :label="$t('additional:modules.tools.mobilityDataDraw.button.addPicture')"
            accept="image/*"
            prepend-icon=""
            @change="saveUploadedIMage"
        ></v-file-input>
    </div>
</template>

<style lang="less" scoped>
    #file_upload_holder {
       display: flex;
    }

    .camera_icon {
        margin-right: 18px;
        margin-left: 8px;
    }
</style>
