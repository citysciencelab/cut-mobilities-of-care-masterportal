<script>
/* example to model data flow */
export default {
    name: "GenericTool",
    props: {
        name: {
            type: String,
            required: true
        }
    }
};
</script>

<template>
    <div>
        <b>{{ name }}</b>
        <slot />
    </div>
</template>

<style lang="less" scoped>
</style>
