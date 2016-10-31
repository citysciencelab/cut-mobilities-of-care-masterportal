define([
    "backbone",
    "backbone.radio",
    "modules/core/util"
], function (Backbone, Radio, Util) {

    var ParcelSearch = Backbone.Model.extend({
        defaults: {
            "fetched": false, // initiales Laden der JSON
            "serviceURL": "", // Flurstücks-Gazetteer-URL
            "districts": {}, // Object mit allen Gemarkungen {{"name": "id"}, {"name2": "id2"}, ...}
            "cadastralDistricts": {}, // Object mit allen Fluren {{"id1": ["name1", "name2"]}, {"id2": ["name1", "name2"]}, ...}
            "districtNumber": "0", // default Gemarkung
            "cadastralDistrictField": false, // sollen Fluren genutzt werden? Wird automatisch beim parsen ermittelt.
            "cadastralDistrictNumber": "0", // default Flur
            "parcelDenominatorField": false, // sollen Flurstücksnenner verwendet werden? Aus config
            "parcelNumber": "", // default Flurstücksnummer
            "parcelDenominatorNumber": "" // default Flurstücksnenner
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
        },
        setStatus: function (args) {
            if (args[2].getId() === "parcelSearch") {
                if (this.get("fetched") === false) {
                    // lade json und Konfiguration
                    this.loadConfiguration(args);
                }
                else {
                    this.set("isCollapsed", args[1]);
                    this.set("isCurrentWin", args[0]);
                }
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        /*
         * liest die gemarkung.json ein. Anschließend wird parse gestartet.
         */
        loadConfiguration: function (args) {
            var restService = Radio.request("RestReader", "getServiceById", args[2].get("serviceId")),
                configJSON = args[2].get("configJSON");

            this.set("parcelDenominatorField", args[2].get("parcelDenominator"));

            if (restService[0] && restService[0].get("url")) {
                this.set("serviceURL", restService[0].get("url"));

                this.fetch({
                    url: configJSON,
                    cache: false,
                    success: function (model) {
                        model.set("fetched", true);
                    },
                    error: function () {
                        Radio.trigger("Alert", "alert", {text: "<strong>Konfiguration der Flurstückssuche konnte nicht geladen werden!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                        Radio.trigger("Window", "closeWin");
                    },
                    complete: Util.hideLoader,
                    beforeSend: Util.showLoader
                });
            }
            else {
                Radio.trigger("Alert", "alert", {text: "<strong>Flurstückssuchen-URL nicht bekannt!</strong>", kategorie: "alert-danger"});
                Radio.trigger("Window", "closeWin");
            }
        },
        /*
         * parst die gemarkung.json. Das JSON-Object hat folgenden Aufbau:
         * {"Allermöhe": { "id": "0601", "flur": ["Flur1", "Flur2"]}, "Alsterdorf": { "id": "0424", "flur": ["Flur3", "Flur4"]}, "Alt-Rahlstedt": { "id": "0544", "flur": []}, ...}
         * Der Wert "flur" ist optional und davon abhängig, ob im nutzenden Bundesland auch Fluren genutzt werden.
         */
        parse: function (obj) {
            var districts = {},
                cadastralDistricts = {};

            _.each(obj, function (value, key) {
                _.extend(districts, _.object([key], [value.id]));
                if (_.has(value, "flur")) {
                    _.extend(cadastralDistricts, _.object([value.id], [value.flur]));
                }
            }, this);
            this.set("districts", districts);
            if (_.values(cadastralDistricts).length > 0) {
                this.set("cadastralDistricts", cadastralDistricts);
                this.set("cadastralDistrictField", true);
            }
            this.set("isCollapsed", false);
            this.set("isCurrentWin", true);
        },
        setDistrictNumber: function (value) {
            this.set("districtNumber", value);
        },
        setCadastralDistrictNumber: function (value) {
            this.set("cadastralDistrictNumber", value);
        },
        setParcelNumber: function (value) {
            this.set("parcelNumber", value);
        },
        setParcelDenominatorNumber: function (value) {
            this.set("parcelDenominatorNumber", value);
        },
        sendRequest: function (data, successFunction) {
            $.ajax({
                url: this.get("serviceURL"),
                data: data,
                context: this,
                success: successFunction,
                timeout: 6000,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Flurstücksabfrage derzeit nicht möglich!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                },
                complete: Util.hideLoader,
                beforeSend: Util.showLoader
            });
        },
        getParcel: function (data) {
            var hit = $("wfs\\:member,member", data),
                coordinate,
                position;

            if (hit.length === 0) {
                EventBus.trigger("alert", "Es wurde kein Flurstück mit der Nummer " + this.get("parcelNumber") + " gefunden.");
            }
            else {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                EventBus.trigger("mapHandler:zoomTo", {type: "Parcel", coordinate: coordinate});
            }
        }
    });

    return ParcelSearch;
});
