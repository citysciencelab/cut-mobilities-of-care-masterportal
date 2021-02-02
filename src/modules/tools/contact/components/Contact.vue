<script>
import moment from "moment";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import Tool from "../../Tool.vue";
import ContactInput from "./ContactInput.vue";
import {keyStore} from "../store/constantsContact";

export default {
    name: "Contact",
    components: {
        Tool,
        ContactInput
    },
    computed: {
        ...mapGetters("Tools/Contact", keyStore.getters)
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
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

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
                <ContactInput
                    :change-function="setUsername"
                    input-name="username"
                    :input-value="username"
                    label-text="Name"
                    :valid-input="validUsername"
                />
                <ContactInput
                    :change-function="setMail"
                    input-name="mail"
                    input-type="email"
                    :input-value="mail"
                    label-text="E-Mail"
                    :valid-input="validMail"
                />
                <ContactInput
                    :change-function="setPhone"
                    input-name="phone"
                    input-type="tel"
                    :input-value="phone"
                    label-text="Tel."
                    :valid-input="validPhone"
                />
                <ContactInput
                    :change-function="setMessage"
                    html-element="textarea"
                    input-name="message"
                    :input-value="message"
                    :label-text="$t('common:modules.tools.contact.messageLabel')"
                    :rows="maxLines"
                    :valid-input="validMessage"
                />
                <div
                    v-if="showPrivacyPolicy"
                    id="tool-contact-privacyPolicy"
                    class="form-group"
                >
                    <label
                        id="tool-contact-privacyPolicy-label"
                        for="tool-contact-privacyPolicy-input"
                    >
                        {{ $t("common: modules.tools.contact.privacyPolicy.label") }}
                    </label>
                    <input
                        id="tool-contact-privacyPolicy-input"
                        :value="privacyPolicyAccepted"
                        type="checkbox"
                    >
                    <span>{{ $t(
                        "common:modules.tools.contact.privacyPolicy.info",
                        {privacyPolicyLink}
                    ) }}</span>
                </div>
                <button
                    type="submit"
                    class="btn btn-default pull-right"
                    :disabled="!validForm"
                >
                    {{ $t("common:modules.tools.contact.sendButton") }}
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
