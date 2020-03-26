
<script>
import {mapGetters} from "vuex";
import ControlIcon from "../ControlIcon.vue";

export default {
    name: "Attributions",
    components: {
        ControlIcon
    },
    props: {
        isInitOpenDesktop: {
            type: Boolean,
            default: true
        },
        isInitOpenMobile: {
            type: Boolean,
            default: false
        }
    },
    data: function () {
        return {
            open: null
        };
    },
    computed: {
        /* TODO
         * Requires a way to actually read the active attributions.
         * Should the map get a vuex module that does this or will
         * such issues be resolved within the respective vue files?
         */
        attributionList () {
            return [
                {name: "Platzhalter", text: "gehaltener Platz"},
                {name: "Platzhalter", text: "gehaltener Platz"}
            ];
        },
        ...mapGetters(["mobile"])
    },
    created () {
        this.open = this.mobile ? this.isInitOpenMobile : this.isInitOpenDesktop;
    },
    methods: {
        toggleAttributionsFlyout: function () {
            this.open = !this.open;
        }
    }
};
</script>

<template>
    <ControlIcon
        class="attributions-button"
        aria-role="button"
        :title="'Layer-Attributions ' + (open ? 'ausblenden' : 'anzeigen')"
        :icon-name="open ? 'forward' : 'info-sign'"
        :click="toggleAttributionsFlyout"
    >
        <div
            v-if="open"
            class="attributions-view"
            @click.stop.prevent=""
        >
            <dl>
                <template v-for="(attribution, index) in attributionList">
                    <dt :key="'attributions-' + index + '-dt'">
                        {{ attribution.name }}:
                    </dt>
                    <dd :key="'attributions-' + index + '-dd'">
                        {{ attribution.text }}
                    </dd>
                </template>
            </dl>
        </div>
    </ControlIcon>
</template>

<style lang="less" scoped>
    @import "../../../theme.less";

    .attributions-view {
        cursor: initial;
        text-align: initial;
        position: absolute;
        padding: 5px;
        background-color: @background_color_3;
        margin-right: 40px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
        border: 1px solid rgb(229, 229, 229);
        bottom: 0;
        right: 0;
        font-size: 12px;
        font-family: @font_family_1;
        color: black;

        dt {
            color: @color_2;
            font-size: 15px;
            font-family: @font_family_1;
        }
        dl {
            margin-bottom: 0;
        }
        dd {
            margin-bottom: 8px;
        }
        img {
            max-height: 2em;
        }
    }
</style>
