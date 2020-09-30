<script>

export default {
    name: "DataTable",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    methods: {
        
    },
    
    mounted () {
        console.log(this.feature.getAttributesToShow());
        console.log(this.feature.getMappedProperties());
    },
    
    watch: {
        feature (newFeature) {
            console.log(this.feature);
            console.log(newFeature);
        }
    }
};
</script>

<template>
    <div></div>
</template>


<style lang="less" scoped>
@import "~variables";

.table > tbody > tr > td {
    padding: 5px 8px;
    font-size: 12px;
    &.bold{
        font-family: @font_family_accent;
    }
}
.gfi-iFrame {
    width: 100%;
    min-height: 40vh;
}

</style>
