<script>
export default {
    name: "ContactInput",
    props: {
        changeFunction: {
            type: Function,
            default: null,
            required: true
        },
        labelText: {
            type: String,
            default: "",
            required: true
        },
        inputName: {
            type: String,
            default: "",
            required: true
        },
        inputType: {
            type: String,
            default: "text"
        },
        inputValue: {
            type: String,
            default: "",
            required: true
        },
        validInput: {
            type: Boolean,
            default: false,
            required: true
        }
    }
};
</script>

<template>
    <div
        :class="['form-group', 'has-feedback', validInput ? 'has-success' : (!inputValue ? '' : 'has-error')]"
    >
        <div class="input-group">
            <label
                class="control-label input-group-addon"
                :for="`tool-contact-${inputName}-input`"
            >{{ labelText }}</label>
            <input
                :id="`tool-contact-${inputName}-input`"
                :value="inputValue"
                :type="inputType"
                class="form-control"
                :aria-describedby="`tool-contact-${inputName}-help`"
                :placeholder="$t(`common:modules.tools.contact.placeholder.${inputName}`)"
                @change="changeFunction($event.currentTarget.value)"
            >
        </div>
        <span
            v-if="validInput"
            class="glyphicon glyphicon-ok form-control-feedback"
            aria-hidden="true"
        />
        <span
            v-else
            :id="`tool-contact-${inputName}-help`"
            class="help-block"
        >
            {{ $t(`common:modules.tools.contact.error.${inputName}`) }}
        </span>
    </div>
</template>

<style scoped>
.control-label {
    min-width: 65px;
}
</style>
