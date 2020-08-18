<script>
export default {
    name: "LegendSingleLayer",
    components: {},
    props: {
        legendObj: {
            type: Object,
            required: true
        },
        renderToId: {
            type: String,
            required: true
        }
    },
    mounted () {
        if (this.renderToId !== "" && document.getElementById(this.renderToId)) {
            // $(this.$el).insertAfter(document.getElementById(this.renderToId));
            document.getElementById(this.renderToId).append(this.$el);
        }
    }
};
</script>

<template>
    <div class="layer-legend">
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
                Zur externen Legende (PDF)
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
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .layer-legend {
        padding-top: 5px;
        padding-bottom: 5px;
    }
</style>
