<script>
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import BildungsatlasCompBarchart from "./BildungsatlasCompBarchart.vue";
import BildungsatlasCompLinechart from "./BildungsatlasCompLinechart.vue";

export default {
    name: "BildungsatlasSchulentlassene",
    components: {
        BildungsatlasCompBarchart,
        BildungsatlasCompLinechart
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
            themeType: "",
            tableData: [],

            barchartTitle: "",
            barchartData: "",
            barchartSetTooltipValue: tooltipItem => {
                return this.getValueForBildungsatlas(tooltipItem.value, true, 2);
            },
            barchartRenderLabelXAxis: year => {
                return Number(year.slice(-2)).toString().padStart(2, "0") + "/" + (Number(year.slice(-2)) + 1).toString().padStart(2, "0");
            },
            barchartRenderLabelYAxis: yValue => {
                return thousandsSeparator(yValue);
            },
            barchartDescriptionXAxis: "Schuljahr",
            barchartDescriptionYAxis: "Anteil Schüler in Prozent",
            barchartBarBackgroundColor: "#d76629",
            barchartBarHoverBackgroundColor: "#337ab7",

            // note: make sure to change the test for createDataLinechart if you change linechartColors
            // barrier free colors
            linechartColors: ["#d73027", "#542788", "#fc8d59", "#91bfdb", "#337ab7"],
            // old colors
            // linechartColors: ["steelblue", "#d72609", "green", "orange", "gray"],
            linechartData: "",
            linechartTitle: "Anzahl verschiedener Abschlüsse je 1000 unter 18-Jährigen",
            linechartSetTooltipValue: tooltipItem => {
                return this.getValueForBildungsatlas(tooltipItem.value, false, 2);
            },
            linechartRenderLabelXAxis: year => {
                return Number(year.slice(-2)).toString().padStart(2, "0") + "/" + (Number(year.slice(-2)) + 1).toString().padStart(2, "0");
            },
            linechartRenderLabelYAxis: yValue => {
                return thousandsSeparator(yValue);
            },
            linechartDescriptionXAxis: "Schuljahr",
            linechartDescriptionYAxis: "Abschlüsse je 1000 unter 18-Jährige",
            linechartBorderWidth: 2,
            linechartPointRadius: 4
        };
    },
    watch: {
        feature (feature) {
            this.refreshGfi(feature);
        }
    },
    created () {
        this.refreshGfi(this.feature);
    },
    methods: {
        /**
         * creates the data for the table
         * @param {String} themeType the theme type of the feature ("Abi" or "oHS")
         * @param {String} layerType the layer type of the feature ("stadtteil" or "sozialraum")
         * @param {Object} properties the properties of the feature
         * @returns {Object}  an object {titleRow[], dataRows[[]]} to use for the table
         */
        createDataForTable (themeType, layerType, properties) {
            const colConfig = [
                    {title: "Abi/FH", desc: "Anteil der Schulentlassenen mit Abitur/Fachhochschulreife"},
                    {title: "MSA", desc: "Anteil der Schulentlassenen mit mittlerem Schulabschluss"},
                    {title: "ESA", desc: "Anteil der Schulentlassenen mit erstem allgemeinbildenden Schulabschluss"},
                    {title: "oSA", desc: "Anteil der Schulentlassenen ohne ersten allgemeinbildenden Schulabschluss"}
                ],
                rowTitleConfig = {
                    stadtteil: "ST_Name", // key eq layerType
                    sozialraum: "SR_Name", // key eq layerType
                    bezirk: "B_Name"
                },
                dataConfig = [
                    [ // stadtteil & sozialraum
                        "C41_Abi", // eq Abi/FH
                        "C41_RS", // eq MSA
                        "C41_mHS", // eq ESA
                        "C41_oHS" // eq oSA
                    ],
                    [ // bezirk
                        "C41_Abi_B", // eq Abi/FH
                        "C41_RS_B", // eq MSA
                        "C41_mHS_B", // eq ESA
                        "C41_oHS_B" // eq oSA
                    ],
                    [ // hamburg
                        "C41_Abi_FHH", // eq Abi/FH
                        "C41_RS_FHH", // eq MSA
                        "C41_mHS_FHH", // eq ESA
                        "C41_oHS_FHH" // eq oSA
                    ]
                ],
                result = {
                    titleRow: [],
                    dataRows: []
                },
                dataKeys = [],
                rowTitles = [];

            // note: dataKeys are put together using dataConfig without loop for a better understanding
            if (themeType === "Abi") {
                result.titleRow = [colConfig[0], colConfig[1], colConfig[2]];
                dataKeys.push([dataConfig[0][0], dataConfig[0][1], dataConfig[0][2]]);
                dataKeys.push([dataConfig[1][0], dataConfig[1][1], dataConfig[1][2]]);
                dataKeys.push([dataConfig[2][0], dataConfig[2][1], dataConfig[2][2]]);
            }
            else {
                result.titleRow = [colConfig[3], colConfig[2], colConfig[1]];
                dataKeys.push([dataConfig[0][3], dataConfig[0][2], dataConfig[0][1]]);
                dataKeys.push([dataConfig[1][3], dataConfig[1][2], dataConfig[1][1]]);
                dataKeys.push([dataConfig[2][3], dataConfig[2][2], dataConfig[2][1]]);
            }

            // rowTitles are created beforehand
            rowTitles.push(properties[rowTitleConfig[layerType]]);
            rowTitles.push(properties[rowTitleConfig.bezirk]);
            rowTitles.push("Hamburg");

            // now the loop will fill result.dataRows with properties using rowTitles and dataKeys
            dataKeys.forEach((keyset, i) => {
                const subdata = [];

                subdata.push(rowTitles[i]);
                keyset.forEach(key => {
                    const property = this.getValueForBildungsatlas(properties[key], true, 0);

                    subdata.push(property);
                });
                result.dataRows.push(subdata);
            });

            return result;
        },

        /**
         * creates the data for the barchart usable as it is as chartjs data
         * @param {String} themeType the theme type of the feature ("Abi" or "oHS")
         * @param {Object} properties the properties of the feature
         * @returns {Object}  an object {labels, datasets} usable for chartjs data
         */
        createDataBarchart (themeType, properties) {
            const prefix = themeType === "Abi" ? "C41_Abi_" : "C41_oHS_",
                regEx = new RegExp("^" + prefix + "(\\d{4})$"),
                labels = [],
                data = [];

            Object.keys(properties).forEach(key => {
                const regExResult = regEx.exec(key);

                if (regExResult === null) {
                    return;
                }

                labels.push(regExResult[1]);
                data.push(properties[key]);
            });

            return {
                labels,
                datasets: [{
                    backgroundColor: this.barchartBarBackgroundColor,
                    hoverBackgroundColor: this.barchartBarHoverBackgroundColor,
                    borderWidth: 0,
                    data
                }]
            };
        },

        /**
         * creates the data for the line chart
         * @param {Object} properties the properties of the feature
         * @returns {Object}  an object {labels, datasets} usable for chartjs data
         */
        createDataLinechart (properties) {
            const totalKey = "__BildungsatlasSchulentlasseneTotal__",
                prefixConfig = {
                    "C42_Abi_": {title: "Abi/FH: Abitur/Fachhochschulreife", color: this.linechartColors[0]},
                    "C42_MSA_": {title: "MSA: mittlerer Schulabschluss", color: this.linechartColors[1]},
                    "C42_ESA_": {title: "ESA: erster allgemeinbildender Schulabschluss", color: this.linechartColors[2]},
                    "C42_oSA_": {title: "oSA: ohne ersten allgemeinbildenden Schulabschluss", color: this.linechartColors[3]},
                    "__BildungsatlasSchulentlasseneTotal__": {title: "Anzahl aller Schulentlassenen", color: this.linechartColors[4]}
                },
                datasetsAssoc = {},
                labelsAssoc = {},
                datasets = [],
                totalAssoc = {};

            Object.keys(properties).forEach(key => {
                const prefix = key.substring(0, 8),
                    regEx = new RegExp("^" + prefix + "(\\d{4})$"),
                    regExResult = regEx.exec(key);

                if (!prefixConfig.hasOwnProperty(prefix) || regExResult === null) {
                    return;
                }

                labelsAssoc[regExResult[1]] = true;

                if (!totalAssoc.hasOwnProperty(regExResult[1])) {
                    totalAssoc[regExResult[1]] = 0;
                }

                // note: this is causing problems with floating point precision in js
                // (e.g. 28.79 + 7.3 = 36.089999999999996)
                // it will be dealt with when mapping datasetsAssoc[totalKey].data
                totalAssoc[regExResult[1]] += Number(this.fixDataBug(properties[key]));

                if (!datasetsAssoc.hasOwnProperty(prefix)) {
                    datasetsAssoc[prefix] = {
                        label: prefixConfig[prefix].title,
                        data: [],
                        backgroundColor: prefixConfig[prefix].color,
                        borderColor: prefixConfig[prefix].color,
                        spanGaps: false,
                        fill: false,
                        borderWidth: this.linechartBorderWidth,
                        pointRadius: this.linechartPointRadius,
                        pointHoverRadius: this.linechartPointRadius,
                        lineTension: 0
                    };
                }
                datasetsAssoc[prefix].data.push(this.fixDataBug(properties[key]));
            });

            // add total to assoc using totalKey (see declaration of prefixConfig)
            datasetsAssoc[totalKey] = {
                label: prefixConfig[totalKey].title,
                data: Object.values(totalAssoc).map(value => {
                    // there can be floating point precision problems in total
                    // so this cuts it down to 2 decimal places
                    return Number(value).toFixed(2);
                }),
                backgroundColor: prefixConfig[totalKey].color,
                borderColor: prefixConfig[totalKey].color,
                spanGaps: false,
                fill: false,
                borderWidth: this.linechartBorderWidth,
                pointRadius: this.linechartPointRadius,
                pointHoverRadius: this.linechartPointRadius,
                lineTension: 0
            };

            // create datasets with assoc using prefixConfig to order
            Object.keys(prefixConfig).forEach(prefix => {
                datasets.push(datasetsAssoc[prefix]);
            });

            return {
                labels: Object.keys(labelsAssoc),
                datasets
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
                properties = feature.getProperties() || {};

            // ("Abi" or "oHS")
            this.themeType = format.themeType;

            // table
            this.tableData = this.createDataForTable(format.themeType, format.layerType, properties);

            // barchart
            if (this.themeType === "Abi") {
                this.barchartTitle = "Anteil \"Abi/FH\" im Zeitverlauf";
            }
            else {
                this.barchartTitle = "Anteil \"ohne Abschluss\" im Zeitverlauf";
            }
            this.barchartData = this.createDataBarchart(this.themeType, properties);

            // linechart
            this.linechartData = this.createDataLinechart(properties);
        }
    }
};
</script>

<template>
    <div class="schulentlassene-gfi-theme">
        <div
            class="tab-panel"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th v-if="themeType === 'Abi'">
                            Anteil der Schulentlassenen mit Abitur/Fachhochschulreife, mittlerem Schulabschluss
                            sowie mit erstem allgemeinbildenden Schulabschluss
                        </th>
                        <th v-else>
                            Anteil der Schulentlassenen ohne ersten allgemeinbildenen Schulabschluss
                        </th>
                    </tr>
                </thead>
            </table>
            <table class="table table-striped">
                <thead>
                    <tr colspan="4">
                        <th></th>
                        <th
                            v-for="(titleRow, titleIdx) of tableData.titleRow"
                            :key="titleIdx"
                            :title="titleRow.desc"
                        >
                            {{ titleRow.title }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(dataRow, rowIdx) of tableData.dataRows"
                        :key="rowIdx"
                        colspan="4"
                    >
                        <td
                            v-for="(data, colIdx) of dataRow"
                            :key="colIdx"
                        >
                            {{ data }}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4">
                            <i></i>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <div class="panel graphHeader barchart">
                <BildungsatlasCompBarchart
                    :chartTitle="barchartTitle"
                    :data="barchartData"
                    :setTooltipValue="barchartSetTooltipValue"
                    :renderLabelXAxis="barchartRenderLabelXAxis"
                    :renderLabelYAxis="barchartRenderLabelYAxis"
                    :descriptionXAxis="barchartDescriptionXAxis"
                    :descriptionYAxis="barchartDescriptionYAxis"
                ></BildungsatlasCompBarchart>
            </div>
            <div class="panel graphHeader linechart">
                <BildungsatlasCompLinechart
                    :chartTitle="linechartTitle"
                    :data="linechartData"
                    :setTooltipValue="linechartSetTooltipValue"
                    :renderLabelXAxis="linechartRenderLabelXAxis"
                    :renderLabelYAxis="linechartRenderLabelYAxis"
                    :descriptionXAxis="linechartDescriptionXAxis"
                    :descriptionYAxis="linechartDescriptionYAxis"
                ></BildungsatlasCompLinechart>
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
            <div v-if="themeType === 'Abi'">
                <h5>
                    <b>Anteil der Schulentlassenen mit Abitur/Fachhochschulreife</b>
                </h5>
                <p>
                    Zur Berechnung dieser Kennzahl wurden sowohl die Abiturientinnen und Abiturienten
                    als auch diejenigen Schülerinnen und Schüler berücksichtigt, die den schulischen
                    Teil der Fachhochschulreife erworben haben. Berücksichtigt wurden nur Schülerinnen
                    und Schüler, die diese Abschlüsse an einer allgemeinbildenden Schule* erworben haben.
                    Die Bezugsgröße für die Schülerinnen und Schüler ist jeweils der Wohnort.
                    Die Anteilsberechnung erfolgt auf Grundlage aller Schulentlassenen allgemeinbildender
                    Schulen im jeweiligen Gebiet.
                </p>
            </div>
            <div v-else>
                <h5>
                    <b>Anteil der Schulentlassenen ohne ersten allgemeinbildenden Schulabschluss*</b>
                </h5>
                <p>
                    Diese Zahl enthält auch Schülerinnen und Schüler mit sonderpädagogischem Förderbedarf.
                    Ein erheblicher Teil dieser Schülerinnen und Schüler erreicht infolge der jeweiligen
                    Lernbeeinträchtigungen keinen ersten allgemeinbildenden oder höherwertigen Schulabschluss.
                </p>
            </div>
            <div>
                <h5>
                    <b>Anzahl verschiedener Abschlüsse je 1000 unter 18-Jährigen</b>
                </h5>
                <p>
                    Die Kennzahl gibt die Anzahl aller Schulentlassenen, sowie die erworbenen Abschlussarten
                    auf 1000 unter 18-Jährigen im Stadtteil/Sozialraum an. Diese Darstellung ermöglicht
                    zusätzlich zu den Abschlussquoten eine bessere Vergleichbarkeit der Schulabschlüsse über
                    die Zeit im betreffenden Stadtteil bzw. Sozialraum.
                </p>

                <h5>
                    <b>Keine oder zu geringe Fallzahlen:</b>
                </h5>
                <p>
                    Die Kennzahlen werden nur in Gebieten ausgewiesen, in denen mindestens 30 Schulentlassene
                    wohnen. In Gebieten, in denen es nach diesem Kriterium zu geringe oder gar keine Fallzahlen
                    gibt, werden keine Werte angezeigt und die Flächen grau eingefärbt.
                </p>

                <br>
                <p>
                    <b>* Allgemeinbildende Schulen</b> vermitteln im Primarbereich die Grundlagen für eine
                    weiterführende Bildung, im Sekundarbereich I und II eine allgemeine Grundbildung bzw.
                    vertiefte Allgemeinbildung. Zu den allgemeinbildenden Schulen der im Bildungsatlas
                    abgebildeten Primarstufe und der Sekundarstufe I gehören in Hamburg Grundschulen,
                    Stadtteilschulen, Gymnasien sowie Sonderschulen.
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.schulentlassene-gfi-theme {
    max-width: 420px;

    .panel {
        &.graphHeader {
            padding: 0 8px 8px;
            border-bottom: 2px solid #ddd;
        }
    }

    .gfi-info {
        padding: 0 10px 10px;
    }
    .linechart {
        height: 430px;
        position: relative;
        margin-bottom: 30px;
    }
    .footer {
        margin: 0 0 10px 10px;
    }
}
</style>
