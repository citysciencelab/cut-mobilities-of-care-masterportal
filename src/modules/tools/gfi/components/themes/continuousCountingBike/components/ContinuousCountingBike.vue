<script>
import {omit} from "../../../../../../../utils/objectHelpers";
import ContinuousCountingBikeInfo from "./ContinuousCountingBikeInfo.vue";
import ContinuousCountingBikeChart from "./ContinuousCountingBikeChart.vue";
import collectYearData from "../library/collectYearData";
import collectWeekData from "../library/collectWeekData";
import collectDayData from "../library/collectDayData";
import collectInfoData from "../library/collectInfoData";


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
         * Parses the mapped properties of gfi into several variables for the graphics and for the info tab.
         * @return {void}
         */
        filterProperties () {
            const all = this.feature.getMappedProperties(),
                infoProps = omit(all, ["Tageslinie", "Wochenlinie", "Jahrgangslinie", "Name", "Typ", "Download"]),
                dayProps = all.hasOwnProperty("Tageslinie") ? all.Tageslinie : null,
                weekProps = all.hasOwnProperty("Wochenlinie") ? all.Wochenlinie : null,
                yearProps = all.hasOwnProperty("Jahrgangslinie") ? all.Jahrgangslinie : null;


            this.downloadLink = all.hasOwnProperty("Download") ? all.Download : this.downloadLink;
            this.infoData = infoProps ? collectInfoData(infoProps) : null;
            this.dayData = dayProps ? collectDayData(dayProps) : null;
            this.weekData = weekProps ? collectWeekData(weekProps) : null;
            this.yearData = yearProps ? collectYearData(yearProps) : null;

            this.dayData.Name = all.Name;
            this.weekData.Name = all.Name;
            this.yearData.Name = all.Name;

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
        onClick (evt) {
            evt.stopPropagation();
            window.open(this.downloadLink);
        }
    }
};
</script>

<template>
    <div class="continuousCountingBike">
        <div class="panel bikeLevelHeader  text-align-center">
            <strong>{{ feature.getMappedProperties().Name }}</strong>
            <br>
            <small>{{ $t("modules.tools.gfi.themes.continuousCountingBike.kind", {kind: feature.getMappedProperties().Typ}) }}</small>
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
                >{{ $t("modules.tools.gfi.themes.continuousCountingBike.info") }}</a>
            </li>
            <li
                v-if="dayData"
                value="lastDay"
                :class="{ active: isActiveTab('lastDay') }"
            >
                <a
                    href="#lastDay"
                    @click="setActiveTab"
                >{{ $t("modules.tools.gfi.themes.continuousCountingBike.lastDay") }}</a>
            </li>
            <li
                v-if="weekData"
                value="lastSevenDays"
                :class="{ active: isActiveTab('lastSevenDays') }"
            >
                <a
                    href="#lastSevenDays"
                    @click="setActiveTab"
                >{{ $t("modules.tools.gfi.themes.continuousCountingBike.lastSevenDays") }}</a>
            </li>
            <li
                v-if="yearData"
                value="year"
                :class="{ active: isActiveTab('year') }"
            >
                <a
                    href="#year"
                    @click="setActiveTab"
                >{{ $t("modules.tools.gfi.themes.continuousCountingBike.year") }}</a>
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
                <span class="glyphicon glyphicon-download"></span>{{ $t("modules.tools.gfi.themes.continuousCountingBike.download") }}
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
    .glyphicon {
        padding-right: 5px;
    }
}
</style>
