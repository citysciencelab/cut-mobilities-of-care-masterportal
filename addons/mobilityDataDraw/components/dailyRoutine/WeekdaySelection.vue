<script>
import { mapGetters, mapActions } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";

export default {
    name: "WeekdaySelection",
    components: {},
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants }
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),

        /**
         * The locale weekday names (Monday to Sunday)
         */
        weekdayNames() {
            const today = new Date(),
                monday = today.setDate(today.getDate() - today.getDay() + 1),
                dayInMs = 24 * 60 * 60 * 1000,
                weekdayNames = [];

            for (let offset = 0; offset < 7; offset++) {
                weekdayNames.push(
                    Intl.DateTimeFormat(this.$i18n.i18next.language, {
                        weekday: "short"
                    }).format(monday + offset * dayInMs)
                );
            }

            return weekdayNames;
        }
    },
    methods: {
        ...mapActions("Tools/MobilityDataDraw", ["toggleWeekday"])
    }
};
</script>

<template lang="html">
    <div>
        <template v-for="(_, weekday) in 7">
            <input
                type="checkbox"
                name="tool-mobilityDataDraw-weekday"
                class="mobility-weekday-input"
                :id="'tool-mobilityDataDraw-weekday-' + weekday"
                :value="weekday"
                :checked="weekdays.includes(weekday)"
                :disabled="
                    currentInteraction === constants.interactionTypes.MODIFY
                "
                @change="toggleWeekday"
            />
            <label
                class="btn btn-lgv-grey mobility-weekday-label"
                v-bind:class="{ active: weekdays.includes(weekday) }"
                :for="'tool-mobilityDataDraw-weekday-' + weekday"
                :key="'tool-mobilityDataDraw-weekday-' + weekday"
                :title="$t('additional:modules.tools.weekday.' + weekday)"
            >
                {{ weekdayNames[weekday] }}
            </label>
        </template>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";

.mobility-weekday-input {
    display: none;

    &[disabled] {
        & + .mobility-weekday-label {
            color: #969696;
            pointer-events: none;
        }
    }

    &:not([disabled]) {
        & + .mobility-weekday-label.active {
            color: #3f51b5;
            background-color: rgba(102, 175, 233, 0.2);
        }
    }
}

.mobility-weekday-label {
    height: 40px;
    width: 40px;
    margin: 0;
    padding: 8px;
    border-radius: 12px;
    font-size: @font_size_huge;
    font-weight: 500;

    &:not(:last-child) {
        margin-right: 5px;
    }
}
</style>
