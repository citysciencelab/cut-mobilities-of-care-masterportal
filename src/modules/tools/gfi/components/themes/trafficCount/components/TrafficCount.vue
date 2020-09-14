<script>
import {TrafficCountCache} from "../library/trafficCountCache";
import TrafficCountInfo from "./TrafficCountInfo.vue";
import TrafficCountDay from "./TrafficCountDay.vue";
import TrafficCountWeek from "./TrafficCountWeek.vue";
import TrafficCountYear from "./TrafficCountYear.vue";

export default {
    name: "TrafficCount",
    components: {
        TrafficCountInfo,
        TrafficCountDay,
        TrafficCountWeek,
        TrafficCountYear
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    }
};
</script>

<template>
    <div>
        <div class="header">
        </div>
        <div>
            <ul
                class="nav nav-pills"
            >
                <li
                    value="infos"
                    class="active"
                >
                    <a
                        data-toggle="tab"
                        href="#infos"
                    >Info</a>
                </li>
                <li value="day">
                    <a
                        data-toggle="tab"
                        href="#day"
                    >Tag</a>
                </li>
                <li value="week">
                    <a
                        data-toggle="tab"
                        href="#week"
                    >Woche</a>
                </li>
                <li value="year">
                    <a
                        data-toggle="tab"
                        href="#year"
                    >Jahr</a>
                </li>
            </ul>
            <div class="tab-content">
                <TrafficCountInfo
                    id="infos"
                    class="tab-pane fade in active"
                />
                <TrafficCountDay
                    id="day"
                    class="tab-pane fade"
                />
                <TrafficCountWeek
                    id="week"
                    class="tab-pane fade"
                />
                <TrafficCountYear
                    id="year"
                    class="tab-pane fade"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
    .header {
        min-width: 280px;
        margin: 0 auto;
        padding: 0 60px;
    }
</style>
