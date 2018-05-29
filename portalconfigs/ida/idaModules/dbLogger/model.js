define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        DbLoggerModel;

    DbLoggerModel = Backbone.Model.extend({
        defaults: {
            isInternetOrDev: false,
            filepath: "",
            date: "",
            time: "",
            produkt: "",
            jahr: "",
            nutzung: "",
            gebuehr: 16,
            lage: "",
            status: "warte"
        },
        initialize: function () {
            var channel = Radio.channel("DBLogger");

            channel.reply({
                "newOrder": this.prepareNewOrder,
                "updateAttrByOrderId": this.updateAttrByOrderId,
                "selectAttrByOrderId": this.selectAttrByOrderId
            }, this);
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
        /*
        * set parameters and run log
        */
        prepareNewOrder: function (filepath, lage, produkt, jahr, nutzung) {
            var timestamp = filepath.split("_")[0];

            this.set("produkt", produkt);
            this.set("jahr", jahr);
            this.set("nutzung", nutzung);
            this.set("date", timestamp.slice(0, 8));
            this.set("time", timestamp.slice(8));
            this.set("filepath", filepath);
            this.set("lage", this.stringifyLage(lage));
            return this.newOrder();
        },
        /**
         * Konvertiert Lage-Objekt in string
         * @param  {object} lage Objekt mit Lagebezeichnung
         * @return {string}      Lagebezeichnung für DB
         */
        stringifyLage: function (lage) {
            var objbez = "";

            if (lage.type === "Adresse") {
                objbez = "Grundstück " + lage.strassenname + " " + lage.hausnummer + lage.hausnummerZusatz + " in " + lage.plz + " Hamburg (" + lage.stadtteil + ")";
            }
            else {
                objbez = "Flurstück " + lage.flurstueck + " in der Gemarkung " + lage.gemarkung.name + " (" + lage.gemarkung.nummer + ") in Hamburg (" + lage.stadtteil + ") mit Zuwegung über " + lage.strassendefinition.streetname;
            }

            return objbez;
        },
        /*
        * logges new order in db
        */
        newOrder: function () {
            var isInternetOrDev = this.get("isInternetOrDev"),
                response = {};

            if (isInternetOrDev) {
                $.ajax({
                    url: Config.loggerDB_INSERT_URL,
                    data: {
                        orderid: this.get("filepath"),
                        date: this.get("date"),
                        time: this.get("time"),
                        produkt: this.get("produkt"),
                        jahr: this.get("jahr"),
                        nutzung: this.get("nutzung"),
                        lage: this.get("lage"),
                        gebuehr: this.get("gebuehr"),
                        status: this.get("status")
                    },
                    async: false,
                    type: "POST",
                    cache: false,
                    dataType: "json",
                    context: this,
                    error: function () {
                        response = {
                            type: "Error",
                            message: "DB Logging fehlgeschlagen!"
                        };
                    },
                    success: function () {
                        response = {
                            type: "Success",
                            message: "Insert erfolgreich!"
                        };
                    },
                    dataFilter: function (data, type) {
                        if (type === "json") {
                            var obj = JSON.parse(data),
                                hasResult = _.has(obj, "result"),
                                isObj = _.isObject(obj.result);

                            if (hasResult && isObj) {
                                return data;
                            }
                        }
                    }
                });
            }
            else {
                response = {
                    type: "Ignore",
                    message: "Nicht im Internet. Logging nicht notwendig!"
                };
            }
            return response;
        },
        /*
        * makes an update of status, based on orderid and payment_status
        */
        updateAttrByOrderId: function (attr, value, orderid) {
            var isInternetOrDev = this.get("isInternetOrDev"),
                response = {};

            if (isInternetOrDev) {
                $.ajax({
                    url: Config.loggerDB_UPDATE_URL,
                    data: {
                        attr: attr,
                        value: value,
                        orderid: orderid
                    },
                    async: false,
                    type: "POST",
                    cache: false,
                    dataType: "json",
                    context: this,
                    error: function () {
                        response = {
                            type: "Error",
                            message: "DB Logging fehlgeschlagen!"
                        };
                    },
                    success: function () {
                        response = {
                            type: "Success",
                            message: "Update erfolgreich!"
                        };
                    },
                    dataFilter: function (data, type) {
                        if (type === "json") {
                            var obj = JSON.parse(data),
                                hasResult = _.has(obj, "result"),
                                isObj = _.isObject(obj.result);

                            if (hasResult && isObj) {
                                return data;
                            }
                        }
                    }
                });
            }
            else {
                response = {
                    type: "Ignore",
                    message: "Nicht im Internet. Logging nicht notwendig!"
                };
            }
            return response;
        },
        selectAttrByOrderId: function (attr, orderid) {
            var isInternetOrDev = this.get("isInternetOrDev"),
                response = {};

            if (isInternetOrDev) {
                $.ajax({
                    url: Config.loggerDB_SELECT_URL,
                    data: {
                        attr: attr,
                        orderid: orderid
                    },
                    async: false,
                    type: "POST",
                    cache: false,
                    dataType: "json",
                    context: this,
                    error: function (data) {
                        response = {
                            type: "Error",
                            message: "DB Abfrage fehlgeschlagen!",
                            result: data.responseText
                        };
                    },
                    success: function (data) {
                        response = {
                            type: "Success",
                            message: "Abfrage erfolgreich!",
                            result: data.result
                        };
                    },
                    dataFilter: function (data, type) {
                        if (type === "json") {
                            var obj = JSON.parse(data),
                                hasResult = _.has(obj, "result"),
                                isObj = _.isObject(obj.result);

                            if (hasResult && isObj) {
                                return data;
                            }
                        }
                    }
                });
            }
            else {
                response = {
                    type: "Ignore",
                    message: "Nicht im Internet. Abfrage nicht möglich!"
                };
            }
            return response;
        }
    });

    return DbLoggerModel;
});
