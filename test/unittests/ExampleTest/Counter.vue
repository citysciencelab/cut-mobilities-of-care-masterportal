// test for this is Counter.spec.js
<script>
export default {
    name: "Counter",
    data () {
        return {
            count: 0
        };
    }
};
</script>

<template>
    <div>
        <span
            class="count"
            v-text="count"
        ></span>
        <button @click="count++">
            Increment
        </button>
    </div>
</template>
