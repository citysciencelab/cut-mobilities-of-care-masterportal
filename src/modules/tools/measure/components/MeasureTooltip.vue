<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersMeasure";

/**
 * Tooltip shown in the map to indicate measurement results and deviance.
 */
export default {
    name: "MeasureTooltip",
    props: {
        featureId: {
            type: String,
            required: true
        }
    },
    computed: {
        ...mapGetters("Tools/Measure", Object.keys(getters)),
        ...mapGetters(["isTableStyle"]),
        /**
         * @returns {MeasureCalculation} calculation to display results of
         */
        featureMeasurement () {
            return this.linesLength[this.featureId] || this.polygonsArea[this.featureId];
        },
        /**
         * Required to decide when tooltip "double click to finish" can be hidden in table style.
         * @returns {boolean} whether feature is currently being drawn
         */
        isBeingDrawn () {
            const feature = this.lines[this.featureId] || this.polygons[this.featureId];

            return Boolean(feature && feature.get("isBeingDrawn"));
        },
        /**
         * Decides whether the tooltip renders the second line.
         * @returns {boolean} whether second line is to be shown
         */
        showDevianceLine () {
            return !this.isTableStyle || this.isBeingDrawn;
        }
    }
};
</script>

<template lang="html">
    <section class="ol-tooltip ol-tooltip-measure measure-tooltip">
        <div>{{ featureMeasurement.measure }}</div>
        <div v-if="showDevianceLine">
            {{ $t(featureMeasurement.deviance) }}
        </div>
    </section>
</template>

<style lang="less" scoped>
@import "~variables";

.measure-tooltip {
    position: relative;

    background: rgba(255, 127, 0, 1.0);
    border-radius: 4px;

    color: #FFFFFF;
    white-space: nowrap;
    font-size: 14px;
    padding: 6px 10px;

    opacity: 0.9;

    user-select: none;
    -ms-user-select: none; /* still needed by IE11 */
    -webkit-user-select: none; /* still needed by Safari */

    &:before {
        content: "";
        position: absolute;

        /* arrow left of box */
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid #ff7f00;

        top: 50%;
        left: -6px;
        transform: translateY(-50%);
    }
    .measure-hint {
        font-size: 10px;
    }
    &.static .measure-hint {
        display: none;
    }
}
</style>
