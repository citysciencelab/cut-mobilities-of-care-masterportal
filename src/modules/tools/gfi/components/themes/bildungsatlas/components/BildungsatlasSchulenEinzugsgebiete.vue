<script>
import {mapGetters} from "vuex";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";

export default {
    name: "BildungsatlasSchulenEinzugsgebiete",
    props: {
        feature: {
            type: Object,
            required: true
        },
        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab: {
            type: Function,
            required: true
        }
    },
    data () {
        return {
            name: "",
            id: "",
            address: "",
            countStudents: "",
            countStudentsPrimary: "",
            countStudentsSecondary: "",
            socialIndex: "",
            /**
             * layer name of internal layer with statistical areas
             * @type {String}
             */
            layernameAreas: "internal Layer for Einzugsgebiete",
            /**
             * layer theme to select school layers for Einzugsgebiete
             * @type {String}
             */
            layerTheme: "schulenEinzugsgebiete",
            /**
             * kind of Einzugsgebiet delivired by feature primary || secondary
             * @type {String}
             */
            schoolKey: "",
            hintText: "Zur Abfrage der Schülerzahlen bewegen Sie den Mauszeiger auf ein Gebiet."
        };
    },
    computed: {
        ...mapGetters({
            isMobile: "mobile"
        }),

        // The Properties of current layer
        getProperties () {
            if (this.feature && typeof this.feature === "object" && this.feature.hasOwnProperty("getProperties")) {
                return this.feature.getProperties();
            }

            return {};
        },

        // The Theme of current layer
        getGfiTheme () {
            if (this.feature && typeof this.feature === "object" && this.feature.hasOwnProperty("getTheme")) {
                return this.feature.getTheme();
            }

            return "";
        },

        // The id of current layer
        getGfiId () {
            if (this.feature && typeof this.feature === "object" && this.feature.hasOwnProperty("getId")) {
                return this.feature.getId();
            }

            return "";
        },

        // The title/name of current layer
        getName () {
            if (this.feature && typeof this.feature === "object" && this.feature.hasOwnProperty("getTitle")) {
                return this.feature.getTitle();
            }

            return "";
        }
    },
    watch: {
        /**
         * When feature is changed, the event will be triggered
         * @param {Object} newVal - the new feature
         * @param {Object} oldVal - the old feature
         * @returns {Void} -
         */
        feature: function (newVal, oldVal) {
            if (oldVal) {
                this.reset(oldVal);
                this.create();
            }
        }
    },
    created: function () {
        if (this.isMobile) {
            this.hintText = "In der mobilen Ansicht ist keine Abfrage der Schülerzahlen möglich.";
        }
    },
    mounted () {
        this.create();
    },
    beforeDestroy: function () {
        this.reset(null);
    },
    methods: {

        /**
         * Sets this GFI
         * @listens Layer#RadioTriggerLayerFeaturesLoaded
         * @returns {Void} -
         */
        create: function () {
            if (this.parseGfiContent(this.getProperties)) {
                const layerEinzugsgebiete = this.getEinzugsgebieteLayer(),
                    layerStatistischeGebiete = this.getStatisticAreasLayer(),
                    id = this.id,
                    schoolKey = this.schoolKey,
                    countStudents = this.countStudents;

                Backbone.Events.listenTo(Radio.channel("VectorLayer"), {
                    "featuresLoaded": this.onFeaturesLoadedEvent
                });

                if (layerEinzugsgebiete) {
                    this.filterFeature(layerEinzugsgebiete, [this.getGfiId]);
                }
                else {
                    console.warn("Missing data for school filter");
                }

                if (layerStatistischeGebiete && id !== "" && schoolKey !== "" && countStudents !== "") {
                    this.filterAreasById(layerStatistischeGebiete, id, schoolKey, countStudents);
                }
                else {
                    console.warn("Missing data for area filter");
                }
            }
        },

        /**
         * Filters the areas by schoolId
         * @param   {ol/layer/Layer} layer Layer with statistical areas
         * @param   {String} id schoolId
         * @param   {String} schoolKey schoolKey
         * @param   {String} countStudents countStudents
         * @returns {Void} -
         */
        filterAreasById: function (layer, id, schoolKey, countStudents) {
            const areas = layer.get("layer").getSource().getFeatures(),
                featureIds = [];

            areas.forEach(function (area) {
                const schools = area.get(schoolKey);

                if (schools) {
                    schools.forEach(function (school) {
                        if (school.schulId === id) {
                            // remember ids of areas with influence of school
                            featureIds.push(area.getId());
                            // set styling category to those areas
                            area.set("styling", this.getCategory(school.anteil));
                            // set mouse hover field with more informations
                            area.set("text", this.getText(school.anteil, countStudents));
                        }
                    }.bind(this));
                }
            }.bind(this));

            layer.setIsSelected(true);
            this.filterFeature([layer], featureIds);
        },

        /**
         * Fired only once when layer of statistical areas is loaded initially to filter areas
         * @param   {String} layerId  layerId that was loaded
         * @returns {Void} -
         */
        onFeaturesLoadedEvent: function (layerId) {
            const conf = this.getStatisticAreasConfig(),
                layerStatistischeGebiete = this.getStatisticAreasLayer(),
                id = this.id,
                schoolKey = this.schoolKey,
                countStudents = this.countStudents;

            if (layerId === conf.id) {
                if (layerStatistischeGebiete && id !== "" && schoolKey !== "" && countStudents !== "") {
                    this.filterAreasById(layerStatistischeGebiete, id, schoolKey, countStudents);
                }
                else {
                    console.warn("Missing data for area filter");
                }
            }
        },

        /**
         * returns  the text as hover ionformation
         * @param   {Number} value anteil in %
         * @param   {Number} countStudents count students
         * @returns {String} text
         */
        getText: function (value, countStudents) {
            const proportion = Math.round(countStudents * value / 100);

            return "Anteil " + String(Math.round(value)) + "% (Anzahl: " + proportion + ")";
        },

        /**
         * returns the category to render area features
         * @param   {Number} value anteil in %
         * @returns {String} styling
         */
        getCategory: function (value) {
            if (value < 5) {
                return "<5";
            }
            else if (value < 10) {
                return "<10";
            }
            else if (value < 15) {
                return "<15";
            }
            else if (value < 30) {
                return "<30";
            }
            return ">=30";
        },

        /**
         * parses the gfiContent and sets all variables
         * @param {Object} attr gfi properties
         * @returns {Boolean} valid true if gfiContent could be parsed
         */
        parseGfiContent: function (attr) {
            if (attr && Object.keys(attr).length !== 0) {
                if (attr.C_S_Nr) {
                    this.id = String(attr.C_S_Nr);
                }
                if (attr.C_S_Name) {
                    this.name = attr.C_S_Name;
                }
                if (attr.C_S_Str && attr.C_S_HNr && attr.C_S_PLZ && attr.C_S_Ort) {
                    this.address = attr.C_S_Str + " " + attr.C_S_HNr + ", " + attr.C_S_PLZ + " " + attr.C_S_Ort;
                }
                if (attr.C_S_SuS_PS && attr.C_S_SuS_S1) {
                    this.countStudents = thousandsSeparator(String(parseInt(attr.C_S_SuS_PS, 10) + parseInt(attr.C_S_SuS_S1, 10) + parseInt(attr.C_S_SuS_S2, 10)));
                }
                if (attr.C_S_SuS_PS) {
                    this.countStudentsPrimary = thousandsSeparator(attr.C_S_SuS_PS.toString());
                }
                if (attr.C_S_SuS_S1) {
                    this.countStudentsSecondary = thousandsSeparator(attr.C_S_SuS_S1.toString());
                }
                if (attr.C_S_SI) {
                    this.socialIndex = attr.C_S_SI === "-1" ? "nicht vergeben" : attr.C_S_SI;
                }
                if (attr.schoolKey) {
                    this.schoolKey = attr.schoolKey;
                }

                return true;
            }

            return false;
        },

        /**
         * requests the Modellist for all layer of einzugsgebiete
         * @param {Object} feature - the feature to be reset
         * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
         * @returns {(ol/layer/Layer[]|Boolean)}

         layers
         */
        getEinzugsgebieteLayer: function (feature) {
            let layers = [],
                gfiTheme = this.getGfiTheme,
                gfiName = this.getName;

            if (feature && typeof feature === "object") {
                if (feature.hasOwnProperty("getTheme")) {
                    gfiTheme = feature.getTheme();
                }
                if (feature.hasOwnProperty("getTitle")) {
                    gfiName = feature.getTitle();
                }
            }

            layers = Radio.request("ModelList", "getModelsByAttributes", {"gfiTheme": gfiTheme, "name": gfiName});

            if (!layers || layers.length === 0) {
                console.warn("No layer configuration with gfiTheme: " + this.layerTheme);

                return false;
            }

            return layers;
        },

        /**
         * Requests the Modellist for layer with layernameAreas. If necessary this function starts its creation.
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @returns {(ol/layer/Layer[]|Boolean)} layers
         */
        getStatisticAreasLayer: function () {
            let layer = Radio.request("ModelList", "getModelByAttributes", {"name": this.layernameAreas});

            if (!layer) {
                const conf = this.getStatisticAreasConfig();

                if (!conf) {
                    console.warn("Cannot create layer without config.");

                    return false;
                }
                layer = this.addStatisticAreasLayer(conf);
            }

            return layer;
        },

        /**
         * Requests the Parser for first layer with statistic areas by name
         * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
         * @returns {(Item|Boolean)} conf
         */
        getStatisticAreasConfig: function () {
            const conf = Radio.request("Parser", "getItemByAttributes", {"name": this.layernameAreas});

            if (!conf) {
                console.warn("No layer configuration with name: " + this.layernameAreas);

                return false;
            }

            return conf;
        },

        /**
         * Creates new layer by given configuration
         * @param {Object} conf layer configuration
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
         * @returns {ol/layer/Layer} Layer
         */
        addStatisticAreasLayer: function (conf) {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: conf.id});
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: conf.id});

            layer.setIsSelected(true);

            return layer;
        },

        /**
         * Hide all features in all given layers except all features with given id
         * @param   {Layer[]} layers  Layers filtered by gfiTheme
         * @param   {String[]} featureIds Array of feature Id to keep
         * @returns {Void} -
         */
        filterFeature: function (layers, featureIds) {
            layers.forEach(function (layer) {
                if (layer.get("isSelected")) {
                    layer.showFeaturesByIds(featureIds);
                }
            });
        },

        /**
         * Show all features in all given layers
         * @param   {Layer[]} layers Layers to show
         * @returns {Void} -
         */
        unfilterFeature: function (layers) {
            layers.forEach(function (layer) {
                if (layer.get("isSelected")) {
                    layer.showAllFeatures();
                }
            });
        },

        /**
         * hide this GFI and resets all layer data
         * @param {Object} feature - the feature to be reset
         * @returns {Void} -
         */
        reset: function (feature) {
            const layerEinzugsgebiete = this.getEinzugsgebieteLayer(feature),
                layerStatistischeGebiete = this.getStatisticAreasLayer();

            if (layerEinzugsgebiete) {
                this.unfilterFeature(layerEinzugsgebiete);
            }

            if (layerStatistischeGebiete) {
                this.unfilterFeature([layerStatistischeGebiete]);
                layerStatistischeGebiete.setIsSelected(false);
            }

            Backbone.Events.stopListening(Radio.channel("VectorLayer"), "featuresLoaded");
        }
    }
};
</script>

<template>
    <div class="gfi-school-catchment-area">
        <div
            class="tab-panel"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th colspan="2">
                            {{ name }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr colspan="2">
                        <td>Adresse:</td>
                        <td>{{ address }}</td>
                    </tr>
                    <tr colspan="2">
                        <td>Gesamtzahl der Schüler:</td>
                        <td>{{ countStudents }}</td>
                    </tr>
                    <tr colspan="2">
                        <td>davon in der Primarstufe:</td>
                        <td>{{ countStudentsPrimary }}</td>
                    </tr>
                    <tr colspan="2">
                        <td>davon in der Sekundarstufe:</td>
                        <td>{{ countStudentsSecondary }}</td>
                    </tr>
                    <tr colspan="2">
                        <td>Sozialindex:</td>
                        <td>{{ socialIndex }}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">
                            <i>{{ hintText }}</i>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div
            class="tab-panel gfi-info"
            :class="{ 'hidden': !isActiveTab('info') }"
        >
            <h5><b>Einzugsgebiete :</b></h5>
            <p>Dargestellt werden die Anteile der Schülerinnen und Schüler der angeklickten Schule nach Wohnort. Dabei können Grundschulen, Sonderschulen (Primarstufe) sowie Stadtteilschulen mit integrierter Grundschule angeklickt werden. Ist ein statistisches Gebiet um die angeklickte Schule beispielsweise dunkel eingefärbt, bedeutet dies, dass ein hoher Anteil der Schülerinnen und Schüler dieser Schule in diesem dunkel eingefärbten Gebiet wohnen. Durch Hovern auf ein eingefärbtes statistisches Gebiet wird die Anzahl der Schülerinnen und Schüler angezeigt, die in diesem Gebiet wohnen und die angeklickte Schule besuchen.</p>
            <p>ACHTUNG: Bei Schulen mit mehreren Zweigstellen wurden die Schülerzahlen aller Zweigstellen addiert und am Hauptstandort der Schule angezeigt. Das gilt auch für die ReBBZ.</p>
            <p>Nicht ausgewiesen werden statistische Gebiete, in denen insgesamt weniger als 5 Schülerinnen und Schüler der Primarstufe wohnen.</p>
        </div>
    </div>
</template>

<style lang="less" scoped>
    .gfi-school-catchment-area {
        max-width: 420px;
        table {
            &.table {
                table-layout: fixed;
                tbody {
                    tr{
                        td {
                            &:last-child {
                                text-align: right;
                            }
                        }
                    }
                }
            }
        }
        .gfi-info {
            padding: 0 10px 10px;
        }

        .hidden {
            display: none;
        }
    }
</style>
