<script>
import {mapGetters} from "vuex";

export default {
    name: "Dipas",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters({
            isTable: "isTableStyle",
            useVectorStyleBeta: "useVectorStyleBeta"
        })
    },
    methods: {
        /**
         * Generates the path for gfi icons.
         * @param  {String} value - gfi feature attribute value for 'Kategorie'(Thema)
         * @fires StyleList#RadioRequestStyleListReturnModeById
         * @returns {String} the path to the icons
         */
        calculateIconPath (value) {
            const styleModel = Radio.request("StyleList", "returnModelById", "beteiligungsfeatures");
            let valueStyle,
                ret = this.feature.getIconPath();

            if (styleModel) {
                if (!this.useVectorStyleBeta && styleModel.has("styleFieldValues")) {
                    // @deprecated with new vectorStyle module. Should be removed with version 3.0.
                    valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                        return styleFieldValue.styleFieldValue === value;
                    });
                    ret = this.fetchIconPathDeprecated(valueStyle);
                }
                else if (this.useVectorStyleBeta && styleModel.has("rules") && styleModel.get("rules").length > 0) {
                    valueStyle = styleModel.get("rules").filter(function (rule) {
                        return rule.conditions.properties.Thema === value;
                    });
                    ret = this.fetchIconPath(valueStyle);
                }
            }
            return ret;
        },
        /**
         * @deprecated with new vectorStyle module. Should be removed with version 3.0.
         * Getting icon from old style format
         * @param  {Array} valueStyle - the list of style values
         * @returns {String} the path of the icons
         */
        fetchIconPathDeprecated (valueStyle) {
            let finalIconPath = this.feature.getIconPath();

            if (valueStyle && valueStyle.length > 0 && ("imageName" in valueStyle[0])) {
                finalIconPath = valueStyle[0].imageName;
            }
            return finalIconPath;
        },

        /**
         * Getting icon from new style format
         * @param  {Array} valueStyle - the list of style values
         * @returns {String} the path of the icons
         */
        fetchIconPath (valueStyle) {
            let finalIconPath = this.feature.getIconPath();

            if (valueStyle && valueStyle.length > 0 && ("imageName" in valueStyle[0].style)) {
                finalIconPath = valueStyle[0].style.imageName;
            }
            return finalIconPath;
        }

    }
};
</script>


<template>
    <div class="dipas-gfi-content">
        <div class="dipas-gfi-icon">
            <img :src="calculateIconPath(feature.getMappedProperties().Kategorie)">
        </div>
        <div class="dipas-gfi-thema">
            {{ feature.getMappedProperties().Kategorie }}
        </div>
        <div
            v-if="!isTable && feature.getMappedProperties().link"
            class="dipas-gfi-name"
        >
            <a
                :href="feature.getMappedProperties().link"
                target="_top"
            >{{ feature.getMappedProperties().name }}</a>
        </div>
        <div
            v-else
            class="dipas-gfi-name"
        >
            {{ feature.getMappedProperties().name }}
        </div>
        <div
            v-if="feature.getMappedProperties().description"
            class="dipas-gfi-description"
        >
            {{ feature.getMappedProperties().description }}
        </div>
        <a
            v-if="!isTable && feature.getMappedProperties().link"
            class="dipas-gfi-more"
            :href="feature.getMappedProperties().link"
            target="_top"
        >mehr</a>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .dipas-gfi-content {
        margin: 12px;
        font-family: @font_family_default;
        .dipas-gfi-thema {
            font-family: @font_family_default;
            font-size: 14px;
            color: #808080;
            text-transform: uppercase;
        }
        .dipas-gfi-name {
            font-family: @font_family_accent;
            font-size: 18px;
            color: #003063;
            padding-bottom: 16px;

            a {
                color: #003063;
            }
        }
        .dipas-gfi-description {
            font-family: @font_family_default;
            font-size: 14px;
            color: #808080;
        }

        .dipas-gfi-icon img{
            width: 30px;
            float: left;
            margin: 0px 10px 10px 0px;
        }

        a.dipas-gfi-more {
            font-size: 12px;
            border-radius: 2px;
            margin-top: 20px;
            padding: 7px 8px 4px;
            background-color: #E40613;
            border-color: #800040;
            color: @accent_contrast;
            font-family: @font_family_accent;
            text-transform: uppercase;
            display: inline-block;
        }
}

</style>
