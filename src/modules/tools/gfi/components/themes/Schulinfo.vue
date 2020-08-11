<script>

export default {
    name: "Schulinfo",
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
        <h1>
            Schulinfo
        </h1>
        <ul>
            <li
                v-for="(value, name) in feature.olFeature.getProperties()"
                :key="name"
            >
                {{ name }}: {{ value }}
            </li>
        </ul>
    </div>
</template>


<style>

</style>
