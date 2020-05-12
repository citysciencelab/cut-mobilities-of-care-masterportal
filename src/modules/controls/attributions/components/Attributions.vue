
<script>
import {mapGetters} from "vuex";

import ControlIcon from "../../ControlIcon.vue";

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
        /* TODO Requires the vuex map module to support giving a list of attributions. */
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
    <div class="attributions-wrapper">
        <ControlIcon
            class="attributions-button"
            :title="'Layer-Attributions ' + (open ? 'ausblenden' : 'anzeigen')"
            :icon-name="open ? 'forward' : 'info-sign'"
            :on-click="toggleAttributionsFlyout"
        />
        <div
            v-if="open"
            class="attributions-view"
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
    </div>
</template>

<style lang="less" scoped>
    @import "../../../../variables.less";

    .attributions-wrapper {
        position: relative;
    }

    .attributions-view {
        color: @secondary_contrast;
        font-size: @font_size_default;
        font-family: @font_family_default;
        font-weight: 400;
        background-color: @secondary;

        border: 1px solid @secondary_border;
        box-shadow: 0 6px 12px @shadow;

        cursor: initial;
        text-align: initial;

        position: absolute;
        padding: 5px;
        bottom: 0;
        right: 100%;

        dt {
            font-size: @font_size_huge;
            color: @primary;
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
