<script>
/*
* Init
*   Window zuhören bzgl setIsvisible --> close aufrufen
*
*/
import {pointColorOptions} from "../../draw/store/constantsDraw";

export default {
    name: "Download",
    created () {
        this.setColorConstants(pointColorOptions);
        // TODO(roehlipa): This event should also be triggered if the back button is pressed
        this.$on("close", this.reset);
    }
};
</script>

<template>
    <!-- TODO: this should be a form -->
    <div
        class="form-horizontal tool-download"
        role="form"
    >
        <div class="form-group form-group-sm">
            <label
                for="tool-download-format"
                class="col-md-3 col-sm-3 control-label"
            >{{ $t("common:modules.tools.download.format") }}</label>
            <div class="col-md-9 col-sm-9">
                <select
                    id="tool-download-format"
                    class="form-control"
                    @change="setSelectedFormat"
                >
                    <option value="none">
                        {{ $t("common:modules.tools.download.pleaseChoose") }}
                    </option>
                    <option
                        v-for="format in formats"
                        :key="'tool-download-format-' + format"
                        :value="format"
                    >
                        {{ format }}
                    </option>
                </select>
            </div>
        </div>
        <div class="form-group form-group-sm">
            <label
                for="tool-download-filename"
                class="col-md-3 col-sm-3 control-label"
            >{{ $t("common:modules.tools.download.filename") }}</label>
            <div class="col-md-9 col-sm-9">
                <input
                    id="tool-download-filename"
                    type="text"
                    class="form-control"
                    :placeholder="$t('common:modules.tools.download.enterFilename')"
                    @keyup="setFileName"
                >
            </div>
        </div>
        <div class="form-group form-group-sm">
            <div class="col-xs-12">
                <a class="col-xs-12 downloadFile">
                    <button
                        class="btn btn-sm btn-lgv-grey col-xs-12"
                        disabled
                        @click="download"
                    >
                        <span class="glyphicon glyphicon-floppy-disk"></span>{{ $t("common:button.download") }}
                    </button>
                </a>
            </div>
        </div>
        <div class="form-group form-group-sm">
            <div class="col-xs-12">
                <button
                    class="btn btn-sm btn-lgv-grey col-xs-12"
                    @click="back"
                >
                    <span class="glyphicon glyphicon-arrow-left"></span>{{ $t("common:button.back") }}
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";

.tool-download a {
    color: #000;
}
.tool-download .downloadFile {
    background-color: buttonface;
    text-decoration: none;
    padding: 0;
}

.tool-download .disabled {
    cursor: not-allowed;
}
</style>
