<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

import * as constants from "../store/constantsDraw";

export default {
    name: "Download",
    computed: {
        ...mapGetters("Tools/Draw", constants.keyStore.getters)
    },
    methods: {
        ...mapMutations("Tools/Draw", constants.keyStore.mutations),
        ...mapActions("Tools/Draw", constants.keyStore.actions)
    }
};
</script>

<template>
    <form
        id="tool-draw-download"
        class="form-horizontal"
        role="form"
    >
        <div class="form-group form-group-sm">
            <label class="col-md-5 col-sm-5 control-label">
                {{ $t("common:modules.tools.draw.download.format") }}
            </label>
            <div class="col-md-7 col-sm-7">
                <select
                    id="tool-draw-download-format"
                    class="form-control"
                    @change="setDownloadSelectedFormat"
                >
                    <option value="none">
                        {{ $t("common:modules.tools.draw.download.pleaseChoose") }}
                    </option>
                    <option
                        v-for="format in download.formats"
                        :key="'tool-draw-download-format-' + format"
                        :value="format"
                    >
                        {{ format }}
                    </option>
                </select>
            </div>
        </div>
        <div class="form-group form-group-sm">
            <label class="col-md-5 col-sm-5 control-label">
                {{ $t("common:modules.tools.draw.download.filename") }}
            </label>
            <div class="col-md-7 col-sm-7">
                <input
                    id="tool-draw-download-filename"
                    type="text"
                    class="form-control"
                    :placeholder="$t('common:modules.tools.draw.download.enterFilename')"
                    @keyup="setDownloadFileName"
                >
            </div>
        </div>
        <div class="form-group form-group-sm">
            <div class="col-md-12 col-sm-12 col-xs-12">
                <a
                    id="tool-draw-download-file"
                    class="col-xs-12 downloadFile"
                    :href="download.fileUrl"
                    :download="download.file"
                    :disabled="download.disabled"
                >
                    <button
                        class="btn btn-sm btn-block btn-lgv-grey"
                        :disabled="download.disabled"
                        type="button"
                    >
                        <span class="glyphicon glyphicon-floppy-disk" />
                        {{ $t("common:button.download") }}
                    </button>
                </a>
            </div>
        </div>
    </form>
</template>

<style lang="less" scoped>
@import "~variables";

#tool-draw-download a {
    color: #000;
}
#tool-draw-download .disabled {
    cursor: not-allowed;
}
#tool-draw-download-file {
    background-color: buttonface;
    text-decoration: none;
    padding: 0;
}
</style>
