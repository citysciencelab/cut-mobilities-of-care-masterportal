<template lang="html">
    <div id="messages" v-bind:class="[position]">
        <div v-for="alert in alerts">
            <div :id="alert.id" :class="['alert', alert.category]" role="alert">
                <button v-if="alert.isDismissable===true" v-on:click="closeAlert('closed', $event)" type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <p>{{ alert.message }}</p>
                <button v-if="alert.isConfirmable" v-on:click="closeAlert('confirmed', $event)" type="button" class="btn btn-primary alert-confirm" aria-label="Close">OK</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    created() {
        const that = this,
            myBus = Backbone.Events;

        myBus.listenTo(Radio.channel("Alert"), {
            "alert": function (alert) {
                that.$store.dispatch("addAlert", alert);
            },
            "alert:remove": function (removeAlertId) {
                that.$store.dispatch("removeAlert", removeAlertId);
            }
        });
    },
    mounted() {    
        document.getElementsByTagName("body")[0].append(this.$el);
    },
    updated() {
        const that = this;

        if (this.fadeOut) {
            $(".alert").fadeOut(this.fadeOut, function () {
                that.$store.dispatch("removeAlert", $(this).attr("id"));
                $(this).remove();
            });
        }
    },
    computed: {
        alerts () {
            return this.$store.state.Alerting.alerts;
        },
        fadeOut () {
            return this.$store.state.Alerting.fadeOut;
        },
        position () {
            return this.$store.state.Alerting.position;
        }
    },
    methods: {
        /**
         * Reacts to click on dismiss or confirm button.
         * @param {string} mode mode that closes the alert.
         * @param {Event} event Click event on dismissable alert.
         * @fires AlertingView#RadioTriggerAlertClosed
         * @return {void}
         */
        closeAlert: function (mode, event) {
            const div = $(event.currentTarget).parent();

            this.$store.dispatch("removeAlert", $(div[0]).attr("id"));
            Radio.trigger("Alert", mode, $(div[0]).attr("id"));
        }
    }
}
</script>

<style lang="less">
div#messages {
    max-width: 100%;
    z-index: 2001;
    position: absolute;
    transform: translate(-50%, -50%);
    .alert {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
    }
}
div#messages.top-center {
    top: 25%;
    left: 50%;
}
div#messages.center-center {
    top: 50%;
    left: 50%;
}
div#messages.bottom-center {
    top: 75%;
    left: 50%;
}
.alert-confirm {
    margin-top: 10px;
    width: 100%;
}
.close {
    outline: none;
}
</style>
