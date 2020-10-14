<script>
import * as moment from "moment";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import {omit} from "../../../../../../../utils/objectHelpers";
import ContinuousCountingBikeInfo from "./ContinuousCountingBikeInfo.vue";
import ContinuousCountingBikeChart from "./ContinuousCountingBikeChart.vue";


export default {
    name: "ContinuousCountingBike",
    components: {
        ContinuousCountingBikeInfo,
        ContinuousCountingBikeChart
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            activeTab: "info",
            infoData: [],
            dayData: {},
            weekData: {},
            yearData: {},
            downloadLink: ""
        };
    },
    mounted () {
        this.filterProperties();
        this.setContentStyle();
    },
    methods: {
        /**
         * Parses the gfiContent into several variables for the graphics and for the info tab.
         * @return {void}
         */
        filterProperties () {
            const all = this.feature.getMappedProperties(),
                infoProps = omit(all, ["Tageslinie", "Wochenlinie", "Jahrgangslinie", "Name", "Typ", "Download"]),
                dayProps = all.hasOwnProperty("Tageslinie") ? all.Tageslinie : null,
                weekProps = all.hasOwnProperty("Wochenlinie") ? all.Wochenlinie : null,
                yearProps = all.hasOwnProperty("Jahrgangslinie") ? all.Jahrgangslinie : null;

            this.downloadLink = all.hasOwnProperty("Download") ? all.Download : this.downloadLink;
            this.infoData = infoProps ? this.getInfoData(infoProps) : null;
            this.dayData = dayProps ? this.getDayData(this.splitDayData(dayProps)) : null;
            this.weekData = weekProps ? this.getWeekData(this.splitWeekData(weekProps)) : null;
            this.yearData = yearProps ? this.getYearData(this.splitYearData(yearProps)) : null;
             

            this.dayData.Name = all.Name;
            this.weekData.Name = all.Name;
            this.yearData.Name = all.Name;

        },
        /**
         * Creates data for the info-tab from given properties.
         * @param {Object} infoProps the for info omitted properties of the gfi
         * @returns {Object} the prepared data for info-tab
         */
        getInfoData (infoProps) {
            const preparedInfoGFIContent = [];

            Object.entries(infoProps).forEach(content => {
                const attribute = content[1],
                    key = content[0];
                let gfiAttributes,
                    isnum,
                    editedAttribute,
                    strongestFrequentedMonth;

                if (attribute.indexOf("|") !== -1) {
                    isnum = new RegExp(/^\d+$/).test(attribute.split("|")[1]);
                    editedAttribute = attribute.split("|");
                    if (isnum === true) {
                        editedAttribute[1] = thousandsSeparator(editedAttribute[1]);
                    }
                    if (key === "Stärkster Monat im Jahr") {
                        strongestFrequentedMonth = new Date(2019, editedAttribute[0] - 1);
                        editedAttribute[0] = moment(strongestFrequentedMonth, "month", "de").format("MMMM");
                    }
                    gfiAttributes = {
                        attrName: key,
                        attrValue: editedAttribute
                    };
                }
                else {
                    gfiAttributes = {
                        attrName: key,
                        attrValue: attribute
                    };
                }
                preparedInfoGFIContent.push(gfiAttributes);
            });
            return preparedInfoGFIContent;
        },

        /**
         * splitYearDataset creates a json for the graphic module with the yearLine data.
         * @param  {String} yearLine contains the year data of gfiContent
         * @fires Util#event:RadioRequestUtilPunctuate
         * @return {Array} tempArr array with prepared objects of the data
         */
        splitYearData (yearLine) {
            const dataSplit = yearLine ? yearLine.split("|") : "",
                tempArr = [];

            dataSplit.forEach(data => {
                const splitted = data.split(","),
                    weeknumber = splitted[1],
                    year = splitted[0],
                    total = parseFloat(splitted[2]),
                    r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                    r_out = splitted[4] ? parseFloat(splitted[4]) : null;

                tempArr.push({
                    class: "dot",
                    style: "circle",
                    timestamp: moment().day("Monday").year(year).week(weeknumber).toDate(),
                    year: year,
                    total: total,
                    tableData: thousandsSeparator(total),
                    r_in: r_in,
                    r_out: r_out
                });
            });

            return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
        },


        /**
         * prepareYearDataset creates an object for the yearDataset
         * @param {Array} data array of objects from yearLineData
         * @returns {void}
         */
        getYearData (data) {
            const graphArray = data ? this.getDataAttributes(data[0]) : "",
                newData = [],
                legendArray = data ? this.getLegendAttributes(data[0]) : "",
                year = data ? data[0].year : "";

            if (data) {
                data.forEach(val => {
                    val.timestamp = moment(val.timestamp).format("w");
                    newData.push(val);
                });
            }

            return {
                data: newData,
                xLabel: "KW im Jahr " + year,
                yLabel: {
                    label: "Anzahl Fahrräder/Woche",
                    offset: 60
                },
                graphArray: graphArray,
                xAxisTicks: {
                    unit: "Kw",
                    values: this.createxAxisTickValues(data, 5)
                },
                legendArray: legendArray
            };
        },

        /**
         * splitLastSevenDaysDataset creates a json for the graphic module with the lastSevenDaysLine data.
         * @param  {String} lastSevenDaysLine contains the lastSevenDays data of gfiContent
         * @fires Util#event:RadioRequestUtilPunctuate
         * @return {Array} tempArr array with prepared objects of the data
         */
        splitWeekData (lastSevenDaysLine) {
            const dataSplit = lastSevenDaysLine ? lastSevenDaysLine.split("|") : "",
                tempArr = [];

            dataSplit.forEach(data => {
                const splitted = data.split(","),
                    // weeknumber = splitted[0],
                    day = splitted[1].split(".")[0],
                    month = splitted[1].split(".")[1] - 1,
                    year = splitted[1].split(".")[2],
                    total = parseFloat(splitted[2]),
                    r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                    r_out = splitted[4] ? parseFloat(splitted[4]) : null;

                tempArr.push({
                    class: "dot",
                    style: "circle",
                    timestamp: new Date(year, month, day, 0, 0, 0, 0),
                    total: total,
                    tableData: thousandsSeparator(total),
                    r_in: r_in,
                    r_out: r_out
                });
            });

            return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
        },
        /**
         * prepareLastSevenDaysDataset creates an object for the lastSevenDaysDataset
         * @param {Array} data array of objects from lastSevenDaysLineData
         * @returns {void}
         */
        getWeekData (data) {
            const startDate = data ? moment(data[0].timestamp).format("DD.MM.YYYY") : "",
                endDate = data ? moment(data.slice(-1).timestamp).format("DD.MM.YYYY") : "",
                graphArray = data ? this.getDataAttributes(data[0]) : "",
                newData = data ? data.map(val => {
                    val.timestamp = moment(val.timestamp).format("DD.MM.YYYY");
                    return val;
                }) : "",
                legendArray = data ? this.getLegendAttributes(data[0]) : "";

            return {
                data: newData,
                xLabel: "Woche vom " + startDate + " bis " + endDate,
                yLabel: {
                    label: "Anzahl Fahrräder/Tag",
                    offset: 60
                },
                graphArray: graphArray,
                xAxisTicks: {
                    values: this.createxAxisTickValues(data, 1)
                },
                legendArray: legendArray
            };
        },

        /**
         * Creates a json for the graphic module with the dayLine data.
         * @param  {String} dayLine contains the dayLine data of gfiContent
         * @return {Array} array with prepared objects of the data
         */
        splitDayData (dayLine) {
            const dataSplit = dayLine ? dayLine.split("|") : [],
                tempArr = [];

            dataSplit.forEach(data => {
                const splitted = data.split(","),
                    day = splitted[0].split(".")[0],
                    month = splitted[0].split(".")[1] - 1,
                    year = splitted[0].split(".")[2],
                    hours = splitted[1].split(":")[0],
                    minutes = splitted[1].split(":")[1],
                    seconds = splitted[1].split(":")[2],
                    total = parseFloat(splitted[2]),
                    r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                    r_out = splitted[4] ? parseFloat(splitted[4]) : null;

                tempArr.push({
                    class: "dot",
                    style: "circle",
                    date: splitted[0],
                    timestamp: new Date(year, month, day, hours, minutes, seconds, 0),
                    total: total,
                    tableData: thousandsSeparator(total),
                    r_in: r_in,
                    r_out: r_out
                });
            });
            return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
        },
        /**
         * Creates an object for  the dayDataset
         * @param {Array} data array of objects from dayLineData
         * @returns {void}
         */
        getDayData (data) {
            const date = data ? moment(data[0].timestamp).format("DD.MM.YYYY") : "",
                graphArray = data ? this.getDataAttributes(data[0]) : "",
                newData = data ? data.map(val => {
                    val.timestamp = moment(val.timestamp).format("HH:mm");
                    return val;
                }) : "",
                legendArray = data ? this.getLegendAttributes(data[0]) : "";

            return {
                data: newData,
                xLabel: "Tagesverlauf am " + date,
                yLabel: {
                    label: "Anzahl Fahrräder/Stunde",
                    offset: 60
                },
                graphArray: graphArray,
                xAxisTicks: {
                    unit: "Uhr",
                    values: this.createxAxisTickValues(data, 6)
                },
                legendArray: legendArray
            };
        },
        /**
         * Returns an array of key values.
         * @param  {Object} inspectData contains the first row of the dataset
         * @return {String[]} showData array with key values
         */
        getDataAttributes (inspectData) {
            const showData = ["total"];

            if (inspectData && inspectData.r_in !== null) {
                showData.push("r_in");
            }
            if (inspectData && inspectData.r_out !== null) {
                showData.push("r_out");
            }

            return showData;
        },
        /**
         * Returns an array for the graphic legend
         * @param  {Object} inspectData contains the first row of the dataset
         * @return {Array} legendData contains an array of objecs for the graphic legend
         */
        getLegendAttributes (inspectData) {
            const legendData = [{
                class: "dot",
                text: "Fahrräder insgesamt",
                style: "circle"
            }];

            if (inspectData && inspectData.r_in !== null) {
                legendData.push({
                    key: "r_in",
                    value: "Fahrräder stadteinwärts"
                });
            }

            if (inspectData && inspectData.r_out !== null) {
                legendData.push({
                    key: "r_out",
                    value: "Fahrräder stadtauswärts"
                });
            }

            return legendData;
        },
        /**
         * createxAxisTickValues returns an array of the tick values for the graph module
         * @param  {Array} data array of objects from dayLineData
         * @param  {Integer} xThinning number for the distance between the ticks
         * @return {Array} tickValuesArray array of the tick values
         */
        createxAxisTickValues (data, xThinning) {
            let tickValuesArray = [],
                startsWith = 0,
                xThinningVal = xThinning;

            data.forEach(ele => {
                tickValuesArray.push(ele.timestamp);
            });

            tickValuesArray = tickValuesArray.filter((d, i) => {
                let val;

                if (d === "1") {
                    startsWith = 1;
                    val = i;
                }
                else if (i + 1 === tickValuesArray.length) {
                    val = 0;
                }
                else if (tickValuesArray.length < 10) {
                    val = 0;
                }
                else if (i === (xThinningVal - startsWith)) {
                    val = 0;
                    xThinningVal = xThinningVal + xThinning;
                }
                else {
                    val = i % xThinningVal;
                }
                return !val;
            });

            return tickValuesArray;
        },

        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab (tab) {
            return this.activeTab === tab;
        },
        /**
         * set the current tab id after clicking.
         * @param {Object[]} evt the target of current click event
         * @returns {Void} -
         */
        setActiveTab (evt) {
            if (evt && evt.target && evt.target.hash) {
                this.activeTab = evt.target.hash.substring(1);
            }
        },
        /**
         * returns the classnames for the tab
         * @param {String} tab name of the tab depending on property activeTab
         * @returns {String} classNames of the tab
         */
        getTabPaneClasses (tab) {
            return {active: this.isActiveTab(tab), in: this.isActiveTab(tab), "tab-pane": true, fade: true};
        },
        /**
         * Setting the gfi content max width the same as graph
         * @returns {Void} -
         */
        setContentStyle () {
            if (document.getElementsByClassName("gfi-content").length) {
                document.getElementsByClassName("gfi-content")[0].style.maxWidth = "780px";
            }
        },
        onClick (evt){ 
            evt.stopPropagation();   
            window.open(this.downloadLink); 
        }    
    }
}
</script>

<template>
    <div class="continuousCountingBike">
        <div class="panel bikeLevelHeader  text-align-center">
            <strong>{{ feature.getMappedProperties().Name }}</strong>
            <br>
            <small>Art: {{ feature.getMappedProperties().Typ }}</small>
        </div>
        <ul
            class="nav nav-pills"
        >
            <li
                v-if="infoData"
                value="info"
                :class="{active: isActiveTab('info') }"
            >
                <a
                    href="#info"
                    @click="setActiveTab"
                >Info</a>
            </li>
            <li
                v-if="dayData"
                value="lastDay"
                :class="{ active: isActiveTab('lastDay') }"
            >
                <a
                    href="#lastDay"
                    @click="setActiveTab"
                >letzter Tag</a>
            </li>
            <li
                v-if="weekData"
                value="lastSevenDays"
                :class="{ active: isActiveTab('lastSevenDays') }"
            >
                <a
                    href="#lastSevenDays"
                    @click="setActiveTab"
                >letzte 7 Tage</a>
            </li>
            <li
                v-if="yearData"
                value="year"
                :class="{ active: isActiveTab('year') }"
            >
                <a
                    href="#year"
                    @click="setActiveTab"
                >Jahr</a>
            </li>
        </ul>
        <div class="tab-content">
            <ContinuousCountingBikeInfo
                id="info"
                key="keyInfo"
                :show="isActiveTab('info')"
                :class="getTabPaneClasses('info')"
                :properties="infoData"
                :type="String('info')"
            />
            <ContinuousCountingBikeChart
                id="lastDay"
                key="keyDay"
                :show="isActiveTab('lastDay')"
                :class="getTabPaneClasses('lastDay')"
                :properties="dayData"
                :type="String('lastDay')"
            />
            <ContinuousCountingBikeChart
                id="lastSevenDays"
                key="keyLastSevenDays"
                :show="isActiveTab('lastSevenDays')"
                :class="getTabPaneClasses('lastSevenDays')"
                :properties="weekData"
                :type="String('lastSevenDays')"
            />
            <ContinuousCountingBikeChart
                id="year"
                key="keyYear"
                :show="isActiveTab('year')"
                :class="getTabPaneClasses('year')"
                :properties="yearData"
                :type="String('year')"
            />
        </div>
        <div
            v-if="!isActiveTab('info')"
            class="continuousCountingBike tab-pane downloadButton fade in active"
        >
            <button 
                class="btn btn-primary csv-download"
                type="button"
                @click="onClick"
            >
                <span class="glyphicon glyphicon-download"></span>Download
            </button>
        </div>
    </div>
</template>

<style lang="less" scoped>
.continuousCountingBike {
    .bikeLevelHeader{
        margin-bottom: 0;
        margin-top: 5px;
    }
     .tab-content {
        padding: 0px 5px 5px 5px;
    }
    .nav-pills{
        margin-left: 10px;
    }
}
</style>
