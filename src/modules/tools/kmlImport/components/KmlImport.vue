<script>
import Tool from "../../Tool.vue";
import {Pointer} from "ol/interaction.js";
import {toStringHDMS, toStringXY} from "ol/coordinate.js";
import {getProjections, transformFromMapProjection} from "masterportalAPI/src/crs";
import {mapActions, mapState} from "vuex";

export default {
    name: "KmlImport",
    components: {
        Tool
    },
    data () {
        return {
            storePath: this.$store.state.Tools.KmlImport
        };
    },
    computed: {
        ...mapState([
            "configJson"
        ]),
        ...mapState("Tools/KmlImport", [
            "renderToWindow",
            "resizableWindow",
            "glyphicon",
            "title",
            "deactivateGFI"
        ]),
        active: {
            get () {
                return this.storePath.active;
            },
            set (val) {
                this.$store.commit("Tools/KmlImport/active", val);
            }
        },
        projections: {
            get () {
                return this.storePath.projections;
            }
        }
    },
    watch: {
        /**
         * since the parsing of the configJson happens after mount,
         * we need to wait with initialize until configJson is parsed to store
         * either here or centrally in App / MapRegionlistening
         * if mounting occurs after config parsing, put the init function to mounted lifecycle hook
         * @listens mapState#configJson
         * @returns {void}
         */
        configJson () {
            // this.initialize();
        },
        active (newValue) {}
    },
    created () {
        console.log("KmlImport Created Hook");
        this.$on("close", this.close);
        this.initialize();
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.activateByUrlParam();
    },
    methods: {
        ...mapActions("Tools/KmlImport", [
            "activateByUrlParam",
            "initialize"
        ]),
        close () {
            this.active = false;
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.storePath.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('modules.tools.KmlImport.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <form
                v-if="active"
                class="form-horizontal"
                role="form"
            >
                <div class="form-group form-group-sm">
                    <label
                        for="coordSystemField"
                        class="col-md-5 col-sm-5 control-label"
                    >{{ $t("modules.tools.kmlImport.kmlFile") }}</label>
                    <div class="col-md-7 col-sm-7"></div>
                </div>
            </form>
        </template>
    </Tool>
</template>
