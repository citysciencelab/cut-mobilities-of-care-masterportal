<script>
export default {
    name: "DropdownSimple",
    props: {
        // The current value.
        value: {
            type: null,
            required: true
        },
        // The keys corresponds to the values of the option elements
        // and the values to the elements text content.
        options: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            selectedOption: null
        };
    },
    watch: {
        value: function (newValue) {
            this.selectedOption = newValue;
        }
    },
    mounted () {
        this.selectedOption = this.value;
    },
    methods: {
        changedValue (event) {
            this.$emit("input", event.target.value);
        }
    }
};
</script>

<template>
    <select
        v-model="selectedOption"
        class="form-control"
        @input="changedValue"
    >
        <option
            v-for="(val, key) in options"
            :key="key"
            :value="key"
        >
            {{ val }}
        </option>
    </select>
</template>
