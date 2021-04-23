<script>
export default {
    name: "ToggleCheckbox",
    props: {
        defaultState: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: "Switch off filter"
        },
        textOn: {
            type: String,
            default: "on"
        },
        textOff: {
            type: String,
            default: "off"
        }
    },

    data () {
        return {
            currentState: false
        };
    },

    computed: {
        isActive () {
            return this.currentState;
        },
        checkedValue: {
            get () {
                return this.currentState;
            },
            set (newValue) {
                this.currentState = newValue;
                this.$emit("change", newValue);
            }
        }
    },

    beforeMount () {
        this.currentState = this.defaultState;
    },

    methods: {
        /**
         * Toggles the state
         * @returns {void} emits change with currentState as payload
         */
        toggle: function () {
            this.currentState = !this.currentState;

            this.$emit("change", this.currentState);
        },
        /**
         * Sets the current State. Required to Undo a change if e.g. a Layer couldn't be loaded.
         * @param {boolean} newValue the new Value
         * @returns {void}
         */
        setActive: function (newValue) {
            this.currentState = newValue;
        }
    }
};
</script>

<template>
    <div
        class="toggleCheckboxComponent toggle btn btn-default btn-sm"
        :class="{'off': !isActive}"
    >
        <input
            v-model="checkedValue"
            type="checkbox"
            :title="title"
            data-toggle="toggle"
            :checked="isActive"
            @click="toggle"
        />
        <div class="toggle-group">
            <label
                class="btn btn-primary btn-sm toggle-on"
                :class="{'active': isActive}"
                @click="toggle"
            >
                {{ textOn }}
            </label>
            <label
                class="btn btn-default btn-sm toggle-off"
                :class="{'active': !isActive}"
                @click="toggle"
            >
                {{ textOff }}
            </label>
            <span
                class="toggle-handle btn btn-default btn-sm"
                @click="toggle"
            >
            </span>
        </div>
    </div>
</template>

<style lang="less" scoped>
    div.toggleCheckboxComponent {
        width:63px;
    }
</style>
