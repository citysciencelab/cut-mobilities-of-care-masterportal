define(function (require) {
    require("idaModules/wps/model");

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        DownloadModel;

    DownloadModel = Backbone.Model.extend({
        defaults: {
            orderid: "",
            idaDownloaded: false,
            billDownloaded: false,
            refreshEnabled: false,
            hasBill: false,
            isInternetOrDev: false
        },
        initialize: function () {
            this.checkIsInternetOrDev();
        },
        /*
        * checks if portal runs in "geoportal-hamburg.de" or "localhost"
        */
        checkIsInternetOrDev: function () {
            var url = window.location.href,
                isInternetOrDev = (url.search("geoportal-hamburg.de") !== -1 || url.search("localhost") !== -1) === true ? true : false;

            this.set("isInternetOrDev", isInternetOrDev);
        },
        /**
         * Fragt die DB zur orderid ab, ob eine Rechung vorliegt
         * @param {string} val orderid
         */
        requestDBforBill: function (val) {
            var response = Radio.request("DBLogger", "selectAttrByOrderId", "rechnungspfad", val),
                billpath = response && response.result && response.result.rechnungspfad ? response.result.rechnungspfad : null;

            this.setHasBill(_.isString(billpath) ? true : false);
        },
        /**
         * Übernimmt die orderid.
         * @param {string} val orderid
         * @fires requestDBforBill#Fragt DB, ob Rechnung vorliegt
         */
        setOrderId: function (val) {
            this.requestDBforBill(val);
            this.set("orderid", val);
        },
        /**
         * gibt orderid zurück
         * @returns {string} orderid
         */
        getOrderId: function () {
            return this.get("orderid");
        },
        /**
         * setzt idaDownloaded auf true
         */
        setIdaDownloaded: function () {
            this.set("idaDownloaded", true);

            if (this.getHasBill() === false || this.getBillDownloaded() === true) {
                this.set("refreshEnabled", true);
            }
        },
        /**
         * gibt idaDownloaded zurück
         * @returns {string} idaDownloaded
         */
        getIdaDownloaded: function () {
            return this.get("idaDownloaded");
        },
        /**
         * setzt billDownloaded auf true
         */
        setBillDownloaded: function () {
            this.set("billDownloaded", true);

            if (this.getIdaDownloaded() === true) {
                this.set("refreshEnabled", true);
            }
        },
        /**
         * gibt billDownloaded zurück
         * @returns {string} billDownloaded
         */
        getBillDownloaded: function () {
            return this.get("billDownloaded");
        },
        /**
         * setHasBill Setzt, das eine Rechnung vorhanden ist
         * @param {boolean} Hat Rechnung?
         */
        setHasBill: function (val) {
            this.set("hasBill", val);
        },
        /**
         * Gibt hasBill zurück
         * @return {boolean} Hat Rechnung?
         */
        getHasBill: function () {
            return this.get("hasBill");
        }
    });

    return DownloadModel;
});
