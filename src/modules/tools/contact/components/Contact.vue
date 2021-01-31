<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import Tool from "../../Tool.vue";
import moment from "moment";
import ContactInput from "./ContactInput.vue";
import {keyStore, minMessageLength} from "../store/constantsContact";

export default {
    name: "Contact",
    components: {
        ContactInput,
        Tool
    },
    computed: {
        ...mapGetters("Tools/Contact", keyStore.getters),
        minMessageLength
    },
    created () {
        this.$on("close", this.close);
        // Change time to the location where customer service is based (see generateTicketId)
        moment.locale(this.locationOfCustomerService);
    },
    methods: {
        ...mapMutations("Tools/Contact", keyStore.mutations),
        ...mapActions("Tools/Contact", keyStore.actions),

        close () {
            this.setActive(false);
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="contactInfo"
                id="tool-contact-addionalInformation"
                class="form-group"
            >
                {{ contactInfo }}
            </div>
            <form @submit.prevent="send">
                <!-- TODO: The user needs more information, if the name is too short -> Also, there are people with such shorts names! -->
                <ContactInput
                    :change-function="setUsername"
                    label-text="Name"
                    input-name="username"
                    :input-value="username"
                    :valid-input="validUsername"
                />
                <ContactInput
                    :change-function="setMail"
                    label-text="E-Mail"
                    input-name="mail"
                    input-type="email"
                    :input-value="mail"
                    :valid-input="validMail"
                />
                <ContactInput
                    :change-function="setPhone"
                    label-text="Tel."
                    input-name="phone"
                    input-type="tel"
                    :input-value="phone"
                    :valid-input="validPhone"
                />
                <!-- TODO: Is there any way to dynamically set an html tag? -> would make it possible that this part can be moved to the other component-->
                <div
                    :class="['form-group', 'has-feedback', validMessage ? 'has-success' : (!message ? '' : 'has-error')]"
                >
                    <label
                        class="control-label input-group-addon"
                        for="tool-contact-message-input"
                    >{{ $t("common:modules.tools.contact.messageLabel") }}</label>
                    <textarea
                        id="tool-contact-message-input"
                        :value="message"
                        class="form-control"
                        aria-describedby="tool-contact-message-help"
                        :placeholder="$t('common:modules.tools.contact.placeholder.message')"
                        :rows="maxLines"
                        @input="setMessage($event.currentTarget.value)"
                    >
                    </textarea>
                    <span
                        v-if="validMessage"
                        class="glyphicon glyphicon-ok form-control-feedback"
                        aria-hidden="true"
                    />
                    <span
                        v-else
                        id="tool-contact-message-help"
                        class="help-block"
                    >
                        {{
                            $t("common:modules.tools.contact.error.messageInput", {length: minMessageLength})
                        }}
                    </span>
                </div>
                <div
                    v-if="showTermsOfPrivacy"
                    id="tool-contact-privacyPolicy"
                    class="form-group"
                >
                    <label>
                        <input
                            v-model="privacyPolicyChecked"
                            type="checkbox"
                        > <!-- TODO: Should the link in the translation be configurable? -->
                        <span>{{ $t('common:modules.tools.contact.privacyPolicy') }}</span>
                    </label>
                </div>
                <button
                    type="submit"
                    class="btn btn-default pull-right"
                    :disabled="!validForm"
                >
                    {{ $t('common:modules.tools.contact.sendButton') }}
                </button>
            </form>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";

    #tool-contact-privacyPolicy {
        label, span {
            cursor: pointer;
        }
    }
</style>
