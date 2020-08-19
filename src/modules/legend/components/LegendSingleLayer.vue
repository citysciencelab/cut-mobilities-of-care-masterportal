<script>
export default {
    name: "LegendSingleLayer",
    components: {},
    props: {
        legendObj: {
            type: Object && undefined,
            required: true
        },
        renderToId: {
            type: String,
            required: true
        }
    },
    watch: {
        legendObj () {
            if (this.renderToId !== "") {
                document.getElementById(this.renderToId).append(this.$el);
            }
        }
    }
};
</script>

<template>
    <div class="layer-legend">
        <template
            v-if="legendObj !== undefined"
        >
            <div
                v-for="legendPart in legendObj.legend"
                :key="JSON.stringify(legendPart)"
            >
                <!-- String -->
                <template
                    v-if="typeof legendPart === 'string'"
                >
                    <!--Legend as Image-->
                    <img
                        v-if="!legendPart.endsWith('.pdf') && !legendPart.endsWith('</svg>')"
                        :src="legendPart"
                    >
                    <!--Legend as SVG-->
                    <div
                        v-if="legendPart.endsWith('</svg>')"
                    >
                        {{ legendPart }}
                    </div>
                    <!--Legend PDF as Link-->
                    <a
                        v-if="legendPart.endsWith('.pdf')"
                        :href="legendPart"
                        target="_blank"
                        :title="legendPart"
                    >
                        {{ $t("common:menu.legend.linkToPdf") }}
                    </a>
                </template>

                <!-- Object -->
                <template
                    v-if="typeof legendPart === 'object'"
                >
                    <!--Legend as Image or SVG -->
                    <img
                        v-if="!legendPart.graphic.endsWith('.pdf')"
                        :src="legendPart.graphic"
                    >

                    <!--Legend PDF as Link-->
                    <a
                        v-if="legendPart.graphic.endsWith('.pdf')"
                        :href="legendPart.graphic"
                        target="_blank"
                        :title="legendPart.graphic"
                    >
                        {{ $t("common:menu.legend.linkToPdf") }}
                    </a>
                    <span>
                        {{ legendPart.name }}
                    </span>
                </template>
            </div>
        </template>
        <template
            v-else
        >
            <span>
                {{ $t("common:menu.legend.noLegendForLayerInfo") }}
            </span>
        </template>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .layer-legend {
        padding-top: 5px;
        padding-bottom: 5px;
        img {
            max-width: 100%;
        }
    }
</style>
