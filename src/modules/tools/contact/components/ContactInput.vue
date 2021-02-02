<script>
import {minMessageLength} from "../store/constantsContact";

export default {
    name: "ContactInput",
    props: {
        changeFunction: {
            type: Function,
            required: true
        },
        htmlElement: {
            type: String,
            default: "input",
            validator: function (value) {
                // only these are explicitly supported
                return ["input", "textarea"].indexOf(value) !== -1;
            }
        },
        inputName: {
            type: String,
            required: true
        },
        inputType: {
            type: String,
            default: "text"
        },
        inputValue: {
            type: String,
            required: true
        },
        labelText: {
            type: String,
            required: true
        },
        rows: {
            type: Number,
            default: 5
        },
        validInput: {
            type: Boolean,
            required: true
        }
    },
    data: function () {
        return {minMessageLength};
    }
};
</script>

<template>
    <div
        :class="[
            'form-group',
            'has-feedback',
            validInput ? 'has-success' : '',
            !validInput && inputValue ? 'has-error' : ''
        ]"
    >
        <div :class="htmlElement === 'input' ? 'input-group' : ''">
            <label
                class="control-label input-group-addon"
                :for="`tool-contact-${inputName}-input`"
            >{{ labelText }}</label>
            <component
                :is="htmlElement"
                :id="`tool-contact-${inputName}-input`"
                :value="inputValue"
                :type="htmlElement === 'input' ? inputType : ''"
                class="form-control"
                :aria-describedby="`tool-contact-${inputName}-help`"
                :placeholder="$t(`common:modules.tools.contact.placeholder.${inputName}`)"
                :rows="htmlElement === 'textarea' ? rows : ''"
                @change="changeFunction($event.currentTarget.value)"
            />
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
            {{ $t(
                `common:modules.tools.contact.error.${inputName + (inputName === "message" ? "Input" : "")}`,
                {length: minMessageLength}
            ) }}
        </span>
    </div>
</template>

<style scoped>
.control-label {
    min-width: 65px;
}
</style>
