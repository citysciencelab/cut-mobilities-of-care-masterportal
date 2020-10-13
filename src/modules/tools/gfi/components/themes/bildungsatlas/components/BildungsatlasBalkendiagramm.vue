<script>
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import BildungsatlasCompBarchart from "./BildungsatlasCompBarchart.vue";

export default {
    name: "BildungsatlasBalkendiagramm",
    components: {
        BildungsatlasCompBarchart
    },
    props: {
        feature: {
            type: Object,
            required: true
        },
        /**
         * fixes the bildungsatlas data bug: any number delivered as -0.0001 should be 0
         * @param {(String|Number)} value the value to fix
         * @returns {(String|Number)}  the fixed value
         */
        fixDataBug: {
            type: Function,
            required: true
        },
        /**
         * any value of the bildungsatlas needs to have a certain format
         * - a percentage has to have a following %
         * - a value equaling null must be shown as *g.F.
         * - any absolute value should have no decimal places
         * - any relative value should have 2 decimal places
         * @param {(String|Number)} value the value to transform
         * @param {Boolean} relative if true, a percent sign will be attached
         * @param {Number} fixedTo the number of decimal places of the returning value
         * @returns {String}  the value for the bildungsatlas based on the input
         */
        getValueForBildungsatlas: {
            type: Function,
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
            barBackgroundColor: "#d76629",
            barHoverBackgroundColor: "#337ab7",

            subThemeTitle: "",
            chartTitle: "",
            description: "",
            themeType: "",
            layerType: "",
            themeCategory: "",
            themeUnit: "",
            chartData: {},
            tableContent: null,
            renderLabelXAxis: xValue => xValue,
            renderLabelYAxis: yValue => {
                return thousandsSeparator(yValue);
            },
            descriptionXAxis: "",
            descriptionYAxis: "",
            setTooltipValue: tooltipItem => tooltipItem.value
        };
    },
    watch: {
        feature (feature) {
            this.refreshGfi(feature);
        }
    },
    mounted () {
        this.refreshGfi(this.feature);
    },
    methods: {
        /**
         * returns the raw title of this sub theme based on the given properties
         * @param {Object} properties the properties as an object with keys stadtteil or sozialraum_name
         * @returns {String}  the content of stadtteil or sozialraum_name or an empty string if no such key was found
         */
        getSubThemeTitle (properties) {
            if (properties === null || typeof properties !== "object") {
                return "";
            }
            else if (properties.hasOwnProperty("stadtteil")) {
                return properties.stadtteil;
            }
            else if (properties.hasOwnProperty("sozialraum_name")) {
                return properties.sozialraum_name;
            }

            return "";
        },
        /**
         * returns the key to use for the current/newest value of the received properties
         * @info in the received properties the data to use is prefixed by a string
         * @param {Object} properties the received properties
         * @param {String} [prefixOfYeardataOpt="jahr_"] the prefix to recognize data with
         * @returns {(String|Boolean)}  the key to use for the current/newest value in properties, false if non was found
         */
        getLastKeyOfYeardata (properties, prefixOfYeardataOpt = "jahr_") {
            let lastKeyOfYeardata = false,
                key = "";

            for (key in properties) {
                if (key.indexOf(prefixOfYeardataOpt) !== 0) {
                    continue;
                }
                if (lastKeyOfYeardata === false || key > lastKeyOfYeardata) {
                    lastKeyOfYeardata = key;
                }
            }
            return lastKeyOfYeardata;
        },
        /**
         * creates an object to place as data in the chartjs bar diagram
         * @param {Object} properties the received properties
         * @param {String} [prefixOfYeardataOpt="jahr_"] the prefix to recognize data with
         * @param {Function} [fixDataBugOpt] a function to parse every value with
         * @returns {Object}  an object to use as data for chartjs
         */
        createDataForDiagram (properties, prefixOfYeardataOpt = "jahr_", fixDataBugOpt) {
            const labels = [],
                data = [],
                fixDataBug = typeof fixDataBugOpt === "function" ? fixDataBugOpt : this.fixDataBug;
            let key = "";

            for (key in properties) {
                if (key.indexOf(prefixOfYeardataOpt) !== 0) {
                    continue;
                }
                labels.push(key.substring(prefixOfYeardataOpt.length));
                data.push(fixDataBug(properties[key]));
            }

            return {
                labels,
                datasets: [{
                    backgroundColor: this.barBackgroundColor,
                    hoverBackgroundColor: this.barHoverBackgroundColor,
                    borderWidth: 0,
                    data
                }]
            };
        },

        /**
         * refreshes the gfi, recalculates properties
         * @pre the Gfi shows the data of the former feature or is not initialized yet
         * @post the Gfi shows the data of the given feature
         * @param {Object} feature the feature to base the refreshed Gfi on
         * @returns {Void}  -
         */
        refreshGfi (feature) {
            const gfiFormat = feature.getGfiFormat() || {},
                format = gfiFormat.gfiBildungsatlasFormat || {},
                properties = feature.getProperties() || {},
                subThemeTitleRaw = this.getSubThemeTitle(properties),
                lastKeyOfYeardata = this.getLastKeyOfYeardata(properties);

            this.description = gfiFormat.gfiBildungsatlasDescription;

            this.themeType = format.themeType;
            this.layerType = format.layerType;
            this.themeCategory = format.themeCategory;
            this.themeUnit = format.themeUnit;

            this.tableContent = {};

            if (this.themeCategory === "schule") {
                this.renderLabelXAxis = year => {
                    return Number(year.slice(-2)).toString().padStart(2, "0") + "/" + (Number(year.slice(-2)) + 1).toString().padStart(2, "0");
                };
                this.descriptionXAxis = "Schuljahr";
            }
            else {
                this.renderLabelXAxis = year => year;
                this.descriptionXAxis = "Jahr";
            }

            if (this.themeUnit === "anteilWanderungen") {
                if (this.layerType === "Stadtteile") {
                    this.subThemeTitle = subThemeTitleRaw;
                    this.chartTitle = subThemeTitleRaw + " im Zeitverlauf";
                    this.tableContent["In " + subThemeTitleRaw] = this.getValueForBildungsatlas(properties[lastKeyOfYeardata], false, 2);
                    this.tableContent["Anteil der Zuzüge aus dem Umland:"] = this.getValueForBildungsatlas(properties.zuzuege_aus_umland, true, 2);
                    this.tableContent["Anteil der Zuzüge ins Umland:"] = this.getValueForBildungsatlas(properties.fortzuege_aus_dem_umland, true, 2);
                }
                else {
                    this.subThemeTitle = subThemeTitleRaw + ": " + properties.statgebiet;
                    this.chartTitle = subThemeTitleRaw + " (" + properties.statgebiet + ") im Zeitverlauf";
                    this.tableContent["im Statistischen Gebiet"] = this.getValueForBildungsatlas(properties[lastKeyOfYeardata], false, 2);
                }

                this.setTooltipValue = tooltipItem => {
                    return this.getValueForBildungsatlas(tooltipItem.value, false, 2);
                };
            }
            else {
                const isRelative = this.themeUnit === "anteil";

                if (properties.summe_stadtteil) {
                    this.subThemeTitle = subThemeTitleRaw + ": " + properties.statgebiet;
                    this.chartTitle = subThemeTitleRaw + " (" + properties.statgebiet + ") im Zeitverlauf";
                    this.tableContent["Statistisches Gebiet"] = this.getValueForBildungsatlas(properties[lastKeyOfYeardata], isRelative, 0);
                    this.tableContent[subThemeTitleRaw] = this.getValueForBildungsatlas(properties.summe_stadtteil, isRelative, 0);
                }
                else {
                    this.subThemeTitle = subThemeTitleRaw;
                    this.chartTitle = subThemeTitleRaw + " im Zeitverlauf";
                    this.tableContent[subThemeTitleRaw] = this.getValueForBildungsatlas(properties[lastKeyOfYeardata], isRelative, 0);
                }

                this.tableContent["Bezirk " + properties.bezirk] = this.getValueForBildungsatlas(properties.summe_bezirk, isRelative, 0);
                this.tableContent.Hamburg = this.getValueForBildungsatlas(properties.summe_hamburg, isRelative, 0);

                this.setTooltipValue = tooltipItem => {
                    return this.getValueForBildungsatlas(tooltipItem.value, isRelative, 2);
                };
            }

            this.chartData = this.createDataForDiagram(properties);
        }
    }
};
</script>

<template>
    <div class="gfi-balkendiagramm">
        <div
            class="tab-panel"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th colspan="2">
                            {{ subThemeTitle }}
                        </th>
                    </tr>
                    <tr>
                        <th colspan="2">
                            {{ description }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(value, key) in tableContent"
                        :key="key"
                    >
                        <td>{{ key }}</td>
                        <td>{{ value }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="panel graphHeader">
                <BildungsatlasCompBarchart
                    :chartTitle="chartTitle"
                    :data="chartData"
                    :setTooltipValue="setTooltipValue"
                    :renderLabelXAxis="renderLabelXAxis"
                    :renderLabelYAxis="renderLabelYAxis"
                    :descriptionXAxis="descriptionXAxis"
                    :descriptionYAxis="descriptionYAxis"
                ></BildungsatlasCompBarchart>
            </div>
            <div class="footer">
                <p>
                    <i>
                        *g.F: geringe Fallzahlen.
                        Die Werte konnten aus datenschutzrechtlichen Gründen nicht ausgewiesen werden
                        oder das Gebiet ist unbewohnt.
                    </i>
                </p>
                <p>
                    Sie können die Position des Fensters durch Drag&#38;Drop ändern.
                </p>
            </div>
        </div>
        <div
            class="tab-panel gfi-info"
            :class="{ 'hidden': !isActiveTab('info') }"
        >
            <div v-if="themeCategory === 'Bevölkerung'">
                <div v-if="themeUnit === 'anzahl'">
                    <br>
                    <p><b>Anzahl der Kinder nach Altersgruppen</b></p>
                    <p>Datenstand: 31.12.2017.</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <P>Die Anzahl der Kinder nach Altersgruppen wird aus datenschutzrechtlichen Gründen nur ausgewiesen, sofern in einem Gebiet mindestens drei Kinder der jeweiligen Altersgruppe wohnen. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                    <br>
                    <p><b>Gebietsveränderungen 2011:</b></p>
                    <p>Am 1.1.2011 gab es in Hamburg eine Veränderung der Gebietszuschnitte bei den statistischen Gebieten und den Stadtteilen. Für die <b>Darstellung der Zeitreihe</b> im Datenblatt auf Ebene der statistischen Gebiete wurden die Daten aus den alten Gebietseinheiten den entsprechenden neuen Gebietseinheiten ab 2011 zugewiesen. Auf Ebene der Stadtteile wurden die Zahlen der 2011 zu Hamm zusammengelegten Stadtteile Hamm-Süd, Hamm-Mitte und Hamm-Nord auch in der Zeitreihe zu dem heutigen Gebiet von Hamm zusammengefasst. Die Neugründung von Neuallermöhe 2011 aus den Stadtteilen Allermöhe und Bergedorf führt in der Darstellung von Zeitreihen auf Stadtteilebene zu größeren Sprüngen in den betroffenen Gebieten.</p>
                </div>
                <div v-else-if="themeUnit === 'anteil'">
                    <br>
                    <p><b>Anteil der Kinder nach Altersgruppen</b></p>
                    <p>Datenstand: 31.12.2017.</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <P>Die Anzahl der Kinder nach Altersgruppen wird aus datenschutzrechtlichen Gründen nur ausgewiesen, sofern in einem Gebiet mindestens drei Kinder der jeweiligen Altersgruppe wohnen. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                    <br>
                    <p><b>Gebietsveränderungen 2011:</b></p>
                    <p>Am 1.1.2011 gab es in Hamburg eine Veränderung der Gebietszuschnitte bei den statistischen Gebieten und den Stadtteilen. Für die <b>Darstellung der Zeitreihe</b> im Datenblatt auf Ebene der statistischen Gebiete wurden die Daten aus den alten Gebietseinheiten den entsprechenden neuen Gebietseinheiten ab 2011 zugewiesen. Auf Ebene der Stadtteile wurden die Zahlen der 2011 zu Hamm zusammengelegten Stadtteile Hamm-Süd, Hamm-Mitte und Hamm-Nord auch in der Zeitreihe zu dem heutigen Gebiet von Hamm zusammengefasst. Die Neugründung von Neuallermöhe 2011 aus den Stadtteilen Allermöhe und Bergedorf führt in der Darstellung von Zeitreihen auf Stadtteilebene zu größeren Sprüngen in den betroffenen Gebieten.</p>
                </div>
                <div v-else-if="themeUnit === 'anteilWanderungen'">
                    <br>
                    <p><b>Wanderungssaldo von Familien</b></p>
                    <p>Datenstand: 31.12.2017.</p>
                    <br>
                    <p><b>Relativer Wanderungssaldo:</b>  Da bei der Darstellung des absoluten Wanderungssaldos einwohnerstarke Stadtteile in der Rangfolge immer weit oben stehen würden, wird hier der aussagekräftigere relative Wanderungssaldo dargestellt, der den Wanderungssaldo der unter 6-Jährigen auf die Einwohnerzahl der Altersgruppe des jeweiligen Stadtteils bezieht (Wanderungssaldo je 100 Einwohnerinnen und Einwohner im Alter von 0 bis unter 6 Jahren). Damit die Bezugsgrundlage weniger anfällig für jährliche Schwankungen ist, wird für das jeweilige Gebiet jeweils ein Durchschnittswert von zwei Jahren berechnet. Für die Berechnung des relativen Wanderungssaldos der unter 6-Jährigen beispielsweise für das Jahr 2014 wird als Bezugsgrundlage also die durchschnittliche Anzahl der unter 6-Jährigen für die Jahre 2013 und 2014 (Bestand 31.12.2013 plus Bestand 31.12.2014 geteilt durch zwei) herangezogen.</p>
                    <br>
                    <p><b>Zu- und Fortzüge Umland:</b></p>
                    <p>Die im Datenblatt angezeigten Anteile der Zuzüge der Kinder unter 6 Jahren aus dem Hamburger Umland wurde aus der absoluten Anzahl der aus dem Umland zugezogenen unter 6-Jährigen anteilig am absoluten Wanderungssaldo (Zuzüge minus Fortzüge) berechnet. Wenn also beispielsweise der absolute Wanderungssaldo in einem Stadtteil -100 und die Anzahl der darunter ins Umland fortgezogenen unter 6-Jährigen 10 beträgt, so sind 10% der Wanderungsbewegungen der unter 6-Jährigen über die Stadtteilgrenzen auf Fortzüge ins Umland zurückzuführen.</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <p>Die Anteile der Kinder von Alleinerziehenden der jeweiligen Altersgruppen werden nur ausgewiesen, sofern in einem Gebiet mindestens 30 Kinder unter 6 Jahren bei Alleinerziehenden wohnen. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                </div>
            </div>
            <div v-else-if="themeCategory === 'schule'">
                <div v-if="themeType === '1-4'">
                    <br>
                    <p><b>Schülerinnen und Schüler der Jahrgänge 1 bis 4:</b></p>
                    <br>
                    <p>Für diese Kennzahl wurden sowohl alle Schülerinnen und Schüler der Hamburger Grundschulen als auch die Schülerinnen und Schüler der Primarstufen* der Hamburger Sonderschulen erfasst. Bezugsgröße ist der Wohnort der Schüler.</p>
                    <br>
                    <p><b>Gebietsveränderungen 2011:</b></p>
                    <p>Am 1.1.2011 gab es in Hamburg eine Veränderung der Gebietszuschnitte bei den statistischen Gebieten und den Stadtteilen. Für die <b>Darstellung der Zeitreihe</b> im Datenblatt auf Ebene der statistischen Gebiete wurden die Daten aus den alten Gebietseinheiten den entsprechenden neuen Gebietseinheiten ab 2011 zugewiesen. Auf Ebene der Stadtteile wurden die Zahlen der 2011 zu Hamm zusammengelegten Stadtteile Hamm-Süd, Hamm-Mitte und Hamm-Nord auch in der Zeitreihe zu dem heutigen Gebiet von Hamm zusammengefasst. Die Neugründung von Neuallermöhe 2011 aus den Stadtteilen Allermöhe und Bergedorf führt in der Darstellung von Zeitreihen auf Stadtteilebene zu größeren Sprüngen in den betroffenen Gebieten.</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <p>Die Anzahl der Schülerinnen und Schüler in der Primarstufe wird nur in Gebieten ausgewiesen, in denen mindestens 3 Kinder dieser Altersgruppe leben. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                    <br>
                    <p><b>* Primarstufe: </b>Die Jahrgangsstufen 1 bis 4.</p>
                </div>
                <div v-else-if="themeType === '5'">
                    <br>
                    <p><b>Schülerinnen und Schüler ab Jahrgang 5</b></p>
                    <br>
                    <p>Die Kennzahl berücksichtigt alle Schülerinnen und Schüler der weiterführenden Schulen in Hamburg. Dies umfasst die Schulformen Stadtteilschule, Gymnasium, Sonderschule und die verbliebenen 6-jährigen Grundschulen.</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <p>Die Anzahl der Schülerinnen und Schüler in der Sekundarstufe I* wird nur in Gebieten ausgewiesen, in denen mindestens 3 Kinder dieser Altersgruppe leben. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                    <br>
                    <p><b>Gebietsveränderungen 2011:</b></p>
                    <p>Am 1.1.2011 gab es in Hamburg eine Veränderung der Gebietszuschnitte bei den statistischen Gebieten und den Stadtteilen. Für die <b>Darstellung der Zeitreihe</b> im Datenblatt auf Ebene der statistischen Gebiete wurden die Daten aus den alten Gebietseinheiten den entsprechenden neuen Gebietseinheiten ab 2011 zugewiesen. Auf Ebene der Stadtteile wurden die Zahlen der 2011 zu Hamm zusammengelegten Stadtteile Hamm-Süd, Hamm-Mitte und Hamm-Nord auch in der Zeitreihe zu dem heutigen Gebiet von Hamm zusammengefasst. Die Neugründung von Neuallermöhe 2011 aus den Stadtteilen Allermöhe und Bergedorf führt in der Darstellung von Zeitreihen auf Stadtteilebene zu größeren Sprüngen in den betroffenen Gebieten.</p>
                    <br>
                    <p><b>* Sekundarstufe: </b>Die Jahrgangsstufen 5 bis 10 bilden die Sekundarstufe I, die Jahrgangsstufen 11 bis 13 die Sekundarstufe II.</p>
                </div>
                <div v-else-if="themeType === 'Gymnasium'">
                    <br>
                    <p><b>Anteil der Schülerinnen und Schüler an Gymnasien</b></p>
                    <br>
                    <p>Für die Berechnung des Anteils der Schülerinnen und Schüler an Gymnasien wurden nur die Schülerinnen und Schüler der Sekundarstufe I* berücksichtigt. Die Bezugsgröße für die Anteilsberechnung sind alle Schülerinnen und Schüler der Sekundarstufe I</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <p>Der Anteil der Schülerinnen und Schüler an Gymnasien wird nur in Gebieten ausgewiesen, in denen mindestens 30 Schülerinnen und Schüler der Sekundarstufe I wohnen. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                    <br>
                    <p><b>Gebietsveränderungen 2011:</b></p>
                    <p>Am 1.1.2011 gab es in Hamburg eine Veränderung der Gebietszuschnitte bei den statistischen Gebieten und den Stadtteilen. Für die <b>Darstellung der Zeitreihe</b> im Datenblatt auf Ebene der statistischen Gebiete wurden die Daten aus den alten Gebietseinheiten den entsprechenden neuen Gebietseinheiten ab 2011 zugewiesen. Auf Ebene der Stadtteile wurden die Zahlen der 2011 zu Hamm zusammengelegten Stadtteile Hamm-Süd, Hamm-Mitte und Hamm-Nord auch in der Zeitreihe zu dem heutigen Gebiet von Hamm zusammengefasst. Die Neugründung von Neuallermöhe 2011 aus den Stadtteilen Allermöhe und Bergedorf führt in der Darstellung von Zeitreihen auf Stadtteilebene zu größeren Sprüngen in den betroffenen Gebieten.</p>
                    <br>
                    <p><b>* Sekundarstufe: </b>Die Jahrgangsstufen 5 bis 10 bilden die Sekundarstufe I, die Jahrgangsstufen 11 bis 13 die Sekundarstufe II.</p>
                </div>
                <div v-else-if="themeType === 'Stadtteilschulen'">
                    <br>
                    <p><b>Anteil der Schülerinnen und Schüler an Stadtteilschulen</b></p>
                    <br>
                    <p>Für die Berechnung des Anteils der Schülerinnen und Schüler an Stadtteilschulen wurden nur die Schülerinnen und Schüler der Sekundarstufe I* berücksichtigt. Die Bezugsgröße für die Anteilsberechnung sind alle Schülerinnen und Schüler der Sekundarstufe I.</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <p>Der Anteil der Schülerinnen und Schüler an Stadtteilschulen wird nur in Gebieten ausgewiesen, in denen mindestens 30 Schülerinnen und Schüler der Sekundarstufe I wohnen. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                    <br>
                    <p><b>Gebietsveränderungen 2011:</b></p>
                    <p>Am 1.1.2011 gab es in Hamburg eine Veränderung der Gebietszuschnitte bei den statistischen Gebieten und den Stadtteilen. Für die <b>Darstellung der Zeitreihe</b> im Datenblatt auf Ebene der statistischen Gebiete wurden die Daten aus den alten Gebietseinheiten den entsprechenden neuen Gebietseinheiten ab 2011 zugewiesen. Auf Ebene der Stadtteile wurden die Zahlen der 2011 zu Hamm zusammengelegten Stadtteile Hamm-Süd, Hamm-Mitte und Hamm-Nord auch in der Zeitreihe zu dem heutigen Gebiet von Hamm zusammengefasst. Die Neugründung von Neuallermöhe 2011 aus den Stadtteilen Allermöhe und Bergedorf führt in der Darstellung von Zeitreihen auf Stadtteilebene zu größeren Sprüngen in den betroffenen Gebieten.</p>
                    <br>
                    <p><b>* Sekundarstufe: </b>Die Jahrgangsstufen 5 bis 10 bilden die Sekundarstufe I, die Jahrgangsstufen 11 bis 13 die Sekundarstufe II.</p>
                </div>
                <div v-else-if="themeType === 'Sonderschulen'">
                    <br>
                    <p><b>Anteil der Schülerinnen und Schüler an Sonderschulen</b></p>
                    <br>
                    <p>Für die Berechnung des Anteils der Schülerinnen und Schüler an Sonderschulen* wurden nur die Schülerinnen und Schüler der Sekundarstufe I** berücksichtigt. Die Bezugsgröße für die Anteilsberechnung sind alle Schülerinnen und Schüler der Sekundarstufe I.</p>
                    <br>
                    <p><b>Keine oder zu geringe Fallzahlen:</b></p>
                    <p>Der Anteil der Schülerinnen und Schüler an Sonderschulen wird nur in Gebieten ausgewiesen, in denen mindestens 30 Schülerinnen und Schüler der Sekundarstufe I wohnen. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.</p>
                    <br>
                    <p><b>Gebietsveränderungen 2011:</b></p>
                    <p>Am 1.1.2011 gab es in Hamburg eine Veränderung der Gebietszuschnitte bei den statistischen Gebieten und den Stadtteilen. Für die <b>Darstellung der Zeitreihe</b> im Datenblatt auf Ebene der statistischen Gebiete wurden die Daten aus den alten Gebietseinheiten den entsprechenden neuen Gebietseinheiten ab 2011 zugewiesen. Auf Ebene der Stadtteile wurden die Zahlen der 2011 zu Hamm zusammengelegten Stadtteile Hamm-Süd, Hamm-Mitte und Hamm-Nord auch in der Zeitreihe zu dem heutigen Gebiet von Hamm zusammengefasst. Die Neugründung von Neuallermöhe 2011 aus den Stadtteilen Allermöhe und Bergedorf führt in der Darstellung von Zeitreihen auf Stadtteilebene zu größeren Sprüngen in den betroffenen Gebieten.</p>
                    <br>
                    <p><b>* Sonderschulen: </b>Seit der Umsetzung inklusiver Bildung an Hamburgs Schulen umfassen die Sonderschulen nur noch die speziellen Sonderschulen. Diese sind entsprechend dem Förderbedarf ihrer Schülerinnen und Schüler in ihrer Arbeit auf die Förderschwerpunkte Hören und Kommunikation, Sehen, geistige Entwicklung und körperliche und motorische Entwicklung ausgerichtet. Die Angebote der früheren Förder- und Sprachheilschulen, die vor 2012 auch zu den Sonderschulen zählten, wurden gemeinsam mit den Angeboten der Regionalen Beratungs- und Unterstützungsstellen (REBUS) 2012 in den Regionalen Bildungs- und Beratungszentren (ReBBZ) zu einem Angebot zusammengeführt. Im Rahmen der seit dem Schuljahr 2011/12 umgesetzten Inklusion an den Hamburger Schulen können Schülerinnen und Schülern mit sonderpädagogischem Förderbedarf sowohl an speziellen Sonderschulen und regionalen Bildungs- und Beratungszentren als auch integrativ an allgemeinen Schulen beschult werden.</p>
                    <br>
                    <p><b>* Sekundarstufe: </b>Die Jahrgangsstufen 5 bis 10 bilden die Sekundarstufe I, die Jahrgangsstufen 11 bis 13 die Sekundarstufe II.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.gfi-balkendiagramm {
    max-width: 420px;
    table {
        &.table {
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
    .panel {
        &.graphHeader {
            padding: 0 8px 8px;
            border-bottom: 2px solid #ddd;
        }
    }
    .gfi-info {
        padding: 0 10px 10px;
    }

    .hidden {
        display: none;
    }
    .footer {
        margin: 0 0 10px 10px;
    }
}
</style>
