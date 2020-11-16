<script>

import Modal from "../../../share-components/modals/Modal.vue";
import axios from "axios";
import {mapGetters} from "vuex";
import {mapActions} from "vuex";

export default {
    name: "Alerting",

    components: {
        Modal
    },

    data: function () {
        return {};
    },

    computed: {
        ...mapGetters("Alerting", [
            "displayedAlerts",
            "fetchBroadcastUrl",
            "localStorageDisplayedAlertsKey",
            "readyToShow",
            "sortedAlerts"
        ]),

        currentUrl: () => {
            // remove hashes
            let urlToCheck = document.URL.replace(/#.*$/, "");

            // then remove get params and make it end with slash
            urlToCheck = urlToCheck.replace(/\/*\?.*$/, "/");

            return urlToCheck;
        },

        console: () => console
    },

    watch: {
        displayedAlerts (newDisplayedAlerts) {
            // Local storage is synced with this.displayedAlerts
            localStorage[this.localStorageDisplayedAlertsKey] = JSON.stringify(newDisplayedAlerts);
        }
    },

    created () {
        Backbone.Events.listenTo(Radio.channel("Alert"), {
            "alert": newAlert => {
                this.addSingleAlert(newAlert);
            }
        });
    },

    mounted () {
        let initialDisplayedAlerts;

        this.initialize();
        if (localStorage[this.localStorageDisplayedAlertsKey] !== undefined) {
            try {
                initialDisplayedAlerts = JSON.parse(localStorage[this.localStorageDisplayedAlertsKey]);

                this.setDisplayedAlerts(initialDisplayedAlerts);
            }
            catch (e) {
                localStorage[this.localStorageDisplayedAlertsKey] = JSON.stringify({});
            }
        }
        else {
            this.setDisplayedAlerts({});
        }

        if (this.fetchBroadcastUrl !== undefined && this.fetchBroadcastUrl !== false) {
            this.fetchBroadcast(this.fetchBroadcastUrl);
            /* DEBUG: This will enable constant alerts to test *
            setInterval(() => {
                this.fetchBroadcast(this.fetchBroadcastUrl);
            }, 5000);
            /**/
        }
    },

    methods: {
        ...mapActions("Alerting", [
            "addSingleAlert",
            "alertHasBeenRead",
            "cleanup",
            "initialize",
            "setDisplayedAlerts"
        ]),

        axiosCallback: function (response) {
            // handle success
            const data = response.data,
                collectedAlerts = [];

            let collectedAlertIds = [];

            if (data.alerts === undefined || typeof data.alerts !== "object") {
                console.warn("No alerts defined.");
                return;
            }

            if (Array.isArray(data.globalAlerts)) {
                collectedAlertIds = [...collectedAlertIds, ...data.globalAlerts];
            }

            if (data.restrictedAlerts !== undefined && typeof data.restrictedAlerts === "object" && Array.isArray(data.restrictedAlerts[this.currentUrl])) {
                collectedAlertIds = [...collectedAlertIds, ...data.restrictedAlerts[this.currentUrl]];
            }

            for (const alertId in data.alerts) {
                if (collectedAlertIds.includes(alertId)) {
                    collectedAlerts.push(data.alerts[alertId]);
                }
            }

            collectedAlerts.forEach(singleAlert => {
                this.addSingleAlert(singleAlert);
            });
        },

        fetchBroadcast: function (fetchBroadcastUrl) {
            axios.get(fetchBroadcastUrl).then(this.axiosCallback).catch(function (error) {
                console.warn(error);
            });
        },

        onModalHid: function () {
            this.cleanup();
        },

        markAsRead: function (hash) {
            this.alertHasBeenRead(hash);
        }
    }
};
</script>

<template>
    <div>
        <Modal
            :show-modal="readyToShow"
            @modalHid="onModalHid"
        >
            <div
                v-for="(alertCategory, categoryIndex) in sortedAlerts"
                :key="alertCategory.category"
                class="alertCategoryContainer"
                :class="{ last: categoryIndex === sortedAlerts.length-1 }"
            >
                <h3>
                    {{ alertCategory.category }}
                </h3>

                <div
                    v-for="(singleAlert, singleAlertIndex) in alertCategory.content"
                    :key="singleAlert.hash"
                    class="singleAlertWrapper"
                    :class="singleAlert.displayClass"
                >
                    <div
                        class="singleAlertContainer"
                        :class="{
                            singleAlertIsImportant: singleAlert.mustBeConfirmed,
                            last: singleAlertIndex === alertCategory.content.length-1
                        }"
                    >
                        <div v-html="singleAlert.content"></div>

                        <p
                            v-if="singleAlert.mustBeConfirmed"
                            class="confirm"
                        >
                            <a
                                @click="markAsRead(singleAlert.hash)"
                            >
                                {{ singleAlert.confirmText }}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
    div.alertCategoryContainer {
        margin-bottom:24px;

        &.last {
            margin-bottom:12px;
        }

        h3 {
            border:none;
            color: @secondary_contrast;
            font-size:14px;
            font-weight:bold;
            letter-spacing:initial;
            line-height:18px;
            margin:0 0 8px 0;
            padding:0;
        }

        div.singleAlertWrapper {
            &.error {
                margin-left:-24px;
                border-left: 4px solid rgba(255, 0, 0, 0.9);
                padding-left: 21px;
            }
            &.warning {
                margin-left:-24px;
                border-left: 4px solid rgba(255, 125, 0, 0.7);
                padding-left: 21px;
            }
        }

        div.singleAlertContainer {
            border-bottom:1px dotted #CCCCCC;
            color:#777777;
            font-size:12px;
            margin-bottom:12px;
            padding-bottom:12px;

            &.singleAlertIsImportant p {
                color:#EE7777;

                &.confirm a {
                    color:#777777;
                    cursor:pointer;
                    text-decoration:underline;

                    &:hover {
                        text-decoration:none;
                    }
                }
            }

            &.last {
                border-bottom:none;
                padding-bottom:0px;
            }
        }
    }
</style>
