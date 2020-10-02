<script>
import {mapGetters} from "vuex";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import mouseOverCotentLivingLocation from "./library/mouseOverContent.js";

export default {
    name: "BildungsatlasSchulenWohnort",
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
            /**
             * the theme type according to config.json -> gfiFormat.gfiBildungsatlasFormat.themeType (should equal school levels: primary, secondary)
             * @type {String}
             */
            themeType: "",
            /**
             * titles for level of schools for each possible themeType (school levels: primary, secondary)
             */
            schoolLevels: {"primary": "Primarstufe", "secondary": "Sekundarstufe I"},
            /**
             * the school level as well formed title based on schoolLevels and themeType
             */
            schoolLevelTitle: "",
            /**
             * correlation between the layer name as defined in config.json (see Themenconfig) and the themeType (school levels: primary, secondary)
             * @type {Object}
             */
            layerNameCorrelation: {"primary": "internal Layer for primary schule am wohnort", "secondary": "internal Layer for middle schule am wohnort"},
            /**
             * area code of the selected district
             * @type {Number}
             */
            StatGeb_Nr: 0,
            /**
             * name of the selected district
             * @type {String}
             */
            ST_Name: "",
            /**
             * total number of students in primary schools living in the selected district
             * @type {Number}
             */
            C12_SuS: 0,
            /**
             * total number of students in middle schools living in the selected district
             * @type {Number}
             */
            C32_SuS: 0,
            /**
             * total number of students to show in the gfi based on numberOfStudents formated with thousand points - for calculations use numberOfStudents instead
             * @type {Number}
             */
            numberOfStudentsInDistrictFormated: 0
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

        // The gfi format of current layer
        getGfiFormat () {
            if (this.feature && typeof this.feature === "object" && this.feature.hasOwnProperty("getGfiFormat")) {
                return this.feature.getGfiFormat();
            }

            return {};
        },

        // The id of current layer
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
    mounted () {
        this.create();
    },
    beforeDestroy: function () {
        this.reset(null);
    },
    methods: {
        /**
         * initialize the content
         * @param   {Boolean} isVisible is gfi visible
         * @returns {Void}  -
         */
        create () {
            const layerStatisticAreas = this.getLayerStatisticAreas();

            let gfiBildungsatlasFormat = {};

            if (this.getGfiFormat.hasOwnProperty("gfiBildungsatlasFormat")) {
                gfiBildungsatlasFormat = this.getGfiFormat.gfiBildungsatlasFormat;
            }

            if (gfiBildungsatlasFormat.hasOwnProperty("themeType")) {
                this.setGFIProperties(this.getProperties, gfiBildungsatlasFormat.themeType);
            }

            if (this.getGfiId !== "") {
                this.showFeaturesByIds(layerStatisticAreas, [this.getGfiId]);
            }

            this.showSchoolLayer();

            Backbone.Events.listenTo(Radio.channel("VectorLayer"), {
                "featuresLoaded": this.showSchoolLayer
            });
        },

        /**
         * Sets this GFI
         * @pre default values (as defined in model.defaults) are in place
         * @post default values themeType, numberOfStudentsInDistrict, StatGeb_Nr and ST_Name are set accordingly to the given arguments
         * @param   {Object} allProperties the properties of this model as simple object that may include {C32_SuS, C12_SuS, StatGeb_Nr, ST_Name}
         * @param   {String} themeType the type of this theme as defined in config.json -> gfiFormat.gfiBildungsatlasFormat.themeType
         * @returns {Void}  -
         */
        setGFIProperties (allProperties, themeType) {
            const schoolLevels = this.schoolLevels;

            if (schoolLevels && schoolLevels.hasOwnProperty(themeType)) {
                this.schoolLevelTitle = schoolLevels[themeType];
            }

            this.themeType = themeType;

            if (themeType === "primary" && allProperties.hasOwnProperty("C12_SuS")) {
                this.numberOfStudentsInDistrictFormated = thousandsSeparator(Math.round(allProperties.C12_SuS));
            }
            else if (themeType === "secondary" && allProperties.hasOwnProperty("C32_SuS")) {
                this.numberOfStudentsInDistrictFormated = thousandsSeparator(Math.round(allProperties.C32_SuS));
            }

            if (allProperties.hasOwnProperty("StatGeb_Nr")) {
                this.StatGeb_Nr = allProperties.StatGeb_Nr;
            }

            if (allProperties.hasOwnProperty("ST_Name")) {
                this.ST_Name = allProperties.ST_Name;
            }
        },

        /**
         * shows the features of the area layer, hides school layers
         * @param {?Object} feature - the feature to be reset
         * @returns {Void}  -
         */
        reset (feature) {
            const layerStatisticAreas = this.getLayerStatisticAreas(feature),
                layerSchools = this.getLayerSchools();

            this.showAllFeatures(layerStatisticAreas);

            if (layerSchools) {
                this.showAllFeatures(layerSchools);
                layerSchools.setIsSelected(false);
            }

            Backbone.Events.stopListening(Radio.channel("VectorLayer"), "featuresLoaded");
        },
        /**
         * returns the html as hover information
         * @param   {Object} school an object type Feature with the school information
         * @param   {function(String):*} school.get a function to request information from the feature
         * @param   {String} schoolLevelTitle the school level as defined in defaults.schoolLevels and selected with themeType
         * @param   {Number} StatGeb_Nr the area code of the selected district as defined in defaults.StatGeb_Nr
         * @param   {Number} numberOfStudentsInDistrict total number of students in the selected district
         * @returns {Object} - the data for the mouseoverTemplate used by the view to fill its html placeholders
         */
        getDataForMouseHoverTemplate (school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict) {
            const data = {
                schoolLevelTitle: schoolLevelTitle,
                schoolName: "",
                address: {
                    street: "",
                    houseNumber: "",
                    postalCode: "",
                    city: ""
                },
                numberOfStudents: "",
                numberOfStudentsPrimary: "",
                socialIndex: "",
                percentageOfStudentsFromDistrict: 0,
                numberOfStudentsFromDistrict: 0
            };

            if (school && typeof school.get === "function") {
                const percentage = this.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr) === false ? 0 : this.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr);

                data.schoolName = school.get("C_S_Name");
                data.address.street = school.get("C_S_Str");
                data.address.houseNumber = school.get("C_S_HNr");
                data.address.postalCode = school.get("C_S_PLZ");
                data.address.city = school.get("C_S_Ort");
                data.numberOfStudents = school.get("C_S_SuS");
                data.numberOfStudentsPrimary = school.get("C_S_SuS_PS");
                data.socialIndex = school.get("C_S_SI") === -1 ? "nicht vergeben" : school.get("C_S_SI");
                data.percentageOfStudentsFromDistrict = Math.round(percentage);
                data.numberOfStudentsFromDistrict = Math.round(numberOfStudentsInDistrict * percentage / 100);
            }

            return data;
        },

        /**
         * get the percentage of students as defined in school using the parameter StatGeb_Nr
         * @param   {Object} school an object type Feature with the school information
         * @param   {function(String):*} school.get a function to request information from the feature
         * @param   {Number} StatGeb_Nr the area code of the selected district as defined in defaults.StatGeb_Nr
         * @returns {Number|Boolean}  the percentage of students defined in school.get("SG_" + StatGeb_Nr) - this should be a float [0 .. 100] - or false if the school seems to have no students from the district defined by StatGeb_Nr
         */
        getPercentageOfStudentsByStatGeb_Nr (school, StatGeb_Nr) {
            if (!school || typeof school.get !== "function" || school.get("SG_" + StatGeb_Nr) === undefined) {
                return false;
            }

            return school.get("SG_" + StatGeb_Nr);
        },

        /**
         * returns the areas layer
         * @param {?Object} feature - the feature to be reset if there exists
         * @returns {Object|Boolean}  - the areas layer or false if there is no such layer
         */
        getLayerStatisticAreas (feature) {
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

            if (!layers || !layers.length || layers.length === 0) {
                return false;
            }

            return layers[0];
        },

        /**
         * Requests the Modellist for layer with layerNameCorrelation. If necessary this function starts its creation.
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @returns {?ol/layer/Layer}  - the layer of schools or false if there aren't any
         */
        getLayerSchools () {
            const modelAttributes = {"name": this.layerNameCorrelation[this.themeType]},
                /**
                 * conf as {Object} - a simple object {id, ...} with config parameters (see config.json -> Themenconfig)
                 * conf is the config of the module based on config.json Themenconfig found by name (see defaults.layerNameCorrelation) choosen by themeType
                 */
                conf = Radio.request("Parser", "getItemByAttributes", modelAttributes);
            let layer = Radio.request("ModelList", "getModelByAttributes", modelAttributes);

            if (!layer && conf && conf.hasOwnProperty("id")) {
                Radio.trigger("ModelList", "addModelsByAttributes", {id: conf.id});
                layer = Radio.request("ModelList", "getModelByAttributes", {id: conf.id});
                layer.setIsSelected(true);
            }

            return layer;
        },

        /**
         * Hide all features in all given layers except all features with given id
         * @param {ol/layer/Layer} layer the Layer filtered by gfiTheme
         * @param {String[]} featureIds Array of feature Id to keep
         * @returns {Void}  -
         */
        showFeaturesByIds (layer, featureIds) {
            if (layer && layer.get("isSelected")) {
                layer.showFeaturesByIds(featureIds);
            }
        },

        /**
         * creates an array of featureIds to select by the model
         * @param {ol/Feature[]} schools an array of features to check
         * @param {String} StatGeb_Nr the urban area number based on the customers content (equals StatGeb_Nr)
         * @returns {String[]}  an array of feature ids where the feature is grouped by StatGeb_Nr
         */
        getFeatureIds (schools, StatGeb_Nr) {
            const featureIds = [];

            if (!Array.isArray(schools)) {
                return featureIds;
            }

            schools.forEach(function (school) {
                if (this.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr) === false) {
                    // continue with forEach
                    return;
                }

                featureIds.push(school.getId());
            }, this);

            return featureIds;
        },

        /**
         * Show all features in all given layers
         * @param {ol/layer/Layer} layer Layer to show
         * @returns {Void}  -
         */
        showAllFeatures (layer) {
            if (layer && layer.get("isSelected")) {
                layer.showAllFeatures();
            }
        },

        /**
         * activates selected features of the school layer and adds html data for mouse hovering
         * @returns {Void}  -
         */
        showSchoolLayer: function () {
            const StatGeb_Nr = this.StatGeb_Nr,
                schoolLevelTitle = this.schoolLevelTitle,
                numberOfStudentsInDistrict = this.numberOfStudentsInDistrictFormated,
                layerSchools = this.getLayerSchools(),
                schools = layerSchools ? layerSchools.get("layer").getSource().getFeatures() : [],
                featureIds = this.getFeatureIds(schools, StatGeb_Nr);

            this.addHtmlMouseHoverCode(schools, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict);

            if (layerSchools) {
                layerSchools.setIsSelected(true);
            }

            this.showFeaturesByIds(layerSchools, featureIds);
        },

        /**
         * adds html mouse hover code to all school features where the StatGeb_Nr valids StatGeb_Nr
         * @pre features may or may not have mouse hover html code already attatched
         * @post all features with a StatGeb_Nr validated by StatGeb_Nr have attatched mouse hover html code
         * @param {ol/Feature[]} schools schools an array of features to check
         * @param {String} schoolLevelTitle schoolLevelTitle the school level as defined in defaults.schoolLevelTitle
         * @param {String} StatGeb_Nr StatGeb_Nr the urban area number based on the customers content (equals StatGeb_Nr)
         * @param {Number} numberOfStudentsInDistrict numberOfStudentsInDistrict total number of students in the selected district
         * @returns {Void}  -
         */
        addHtmlMouseHoverCode: function (schools, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict) {
            let attr;

            schools.forEach(function (school) {
                if (this.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr) === false) {
                    // continue with forEach
                    return;
                }

                attr = this.getDataForMouseHoverTemplate(school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict);
                school.set("schoolsOnLivingLocaltion", mouseOverCotentLivingLocation(attr));
            }, this);
        }
    }
};
</script>

<template>
    <div class="gfi-school-living-location">
        <div
            class="tab-panel"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th colspan="2">
                            Statistisches Gebiet: {{ StatGeb_Nr }}<br>({{ ST_Name }})
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr colspan="2">
                        <td> Anzahl der Schülerinnen und Schüler im statistischen Gebiet in der {{ schoolLevelTitle }}:</td>
                        <td>{{ numberOfStudentsInDistrictFormated }}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td
                            v-if="isMobile"
                            colspan="2"
                        >
                            <i>In der mobilen Ansicht ist keine Abfrage der Schülerzahlen möglich.</i>
                        </td>
                        <td
                            v-else
                            colspan="2"
                        >
                            <i>Zur Abfrage der Schülerzahlen bewegen Sie den Mauszeiger über eine Schule.</i>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div
            class="tab-panel gfi-info"
            :class="{ 'hidden': !isActiveTab('info') }"
        >
            <div v-if="themeType === 'primary'">
                <br>
                <p><b>Schulwahl am Wohnort :</b></p>
                <br>
                <p>In der Karte dargestellt sind Schulen mit Primarstufe (Grundschulen, Stadtteilschulen mit integrierter Grundschule und Sonderschulen), die von Schülerinnen und Schülern eines von Ihnen ausgewählten Gebiets besucht werden. Durch Auswahl eines statistischen Gebiets werden die besuchten Schulen größenproportional angezeigt. Die absolute Anzahl an Schülerinnen und Schüler eines Gebietes, die in der Primarstufe sind, wird im Datenblatt durch Klicken auf die Schule angezeigt.</p>
                <br>
                <p><b>ACHTUNG:</b> Bei Schulen mit mehreren Zweigstellen wurden die Schülerzahlen aller Zweigstellen addiert und am Hauptstandort der Schule angezeigt. Das gilt auch für die ReBBZ.</p>
                <br>
                <p>Nicht ausgewiesen werden statistische Gebiete, in denen insgesamt weniger als 5 Schülerinnen und Schüler der Primarstufe wohnen.</p>
            </div>
            <div v-else>
                <br>
                <p><b>Schulwahl am Wohnort :</b></p>
                <br>
                <p>In der Karte dargestellt sind Schulen mit der Sekundarstufe I (Stadtteilschulen, Gymnasien, Sonderschulen), die von Schülerinnen und Schülern eines von Ihnen ausgewählten Gebiets besucht werden. Durch Auswahl eines statistischen Gebiets werden die besuchten Schulen größenproportional angezeigt. Die absolute Anzahl an Schülerinnen und Schüler eines Gebietes, die in der Sekundarstufe I sind, wird im Datenblatt durch Klicken auf die Schule angezeigt.</p>
                <br>
                <p><b>ACHTUNG:</b> Bei Schulen mit mehreren Zweigstellen wurden die Schülerzahlen aller Zweigstellen addiert und am Hauptstandort der Schule angezeigt. Das gilt auch für die ReBBZ.</p>
                <br>
                <p>Nicht ausgewiesen werden statistische Gebiete, in denen insgesamt weniger als 5 Schülerinnen und Schüler der Sekundarstufe I wohnen.</p>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
    .gfi-school-living-location {
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
