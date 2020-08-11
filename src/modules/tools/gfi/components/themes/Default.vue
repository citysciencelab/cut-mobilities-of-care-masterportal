<script>

export default {
    name: "Default",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        featureProperties () {
            return this.feature.olFeature.getProperties();
        }
    }
};
</script>

<template>
    <table class="table table-hover">
        <tbody>
            <tr
                v-for="(value, name) in featureProperties"
                :key="name"
            >
                <th>{{ name }}</th>
                <td>{{ value }}</td>
            </tr>
        </tbody>
    </table>
</template>


<style lang="less" scoped>
@import "~variables";

th {
    font-family: @font_family_accent;
}

</style>
