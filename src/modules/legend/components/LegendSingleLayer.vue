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
                <!--Legend as Image or SVG-->
                <img
                    v-if="(typeof legendPart === 'string' && !legendPart.endsWith('.pdf'))"
                    :src="legendPart"
                >

                <!--Legend PDF as Link-->
                <a
                    v-if="(typeof legendPart === 'string' && legendPart.endsWith('.pdf'))"
                    :href="legendPart"
                    target="_blank"
                    :title="legendPart"
                >
                    {{ $t("common:menu.legend.linkToPdf") }}
                </a>

                <!--Legend as Image from Object-->
                <img
                    v-if="(typeof legendPart === 'object')"
                    :src="legendPart.graphic"
                >
                <span
                    v-if="(typeof legendPart === 'object')"
                >{{ legendPart.name }}</span>
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
