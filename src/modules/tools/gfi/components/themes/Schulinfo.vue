<script>

export default {
    name: "Schulinfo",
    methods: {
        upperFirst (string) {
            return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
        }
    }
};
</script>

<template>
    <div>
        <h1>
            Schulinfo
        </h1>
    </div>
</template>


<style>

</style>
