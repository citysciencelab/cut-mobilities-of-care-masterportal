define([
    "backbone",
    "eventbus",
    "backbone.radio",
    "config",
    "modules/core/util"
], function (Backbone, EventBus, Radio, Config, Util) {

    var ParcelSearch = Backbone.Model.extend({
        defaults: {
            "fetched": false,
            "configJSON": "",
            "serviceURL": "",
            "districtsName": "",
            "cadastralDistrictsName": "",
            "districts": {},
            "cadastralDistricts": {},
            "districtNumber": ""
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
        },
        validate: function (attributes) {
            var onlyNumbers = /^\d+$/;

            if (attributes.parcelNumber.length < 1) {
                return "Bitte geben Sie eine Flurstücksnummer ein";
            }
            if (!attributes.parcelNumber.match(onlyNumbers)) {
                return "Bitte geben Sie nur Ziffern ein";
            }
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
        loadConfiguration: function (args) {
            var restService = Radio.request("RestReader", "getServiceById", args[2].get("serviceId")),
                configJSON = args[2].get("configJSON");

            this.set("districtsName", args[2].get("districts"));
            this.set("cadastralDistrictsName", args[2].get("cadastralDistricts"));

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
        parse: function (obj) {
            this.set("districts", _.values(_.pick(obj, this.get("districtsName")))[0]);
            this.set("cadastralDistricts", _.values(_.pick(obj, this.get("cadastralDistrictsName")))[0]);
            this.set("isCollapsed", false);
            this.set("isCurrentWin", true);
        },
        setDistrictNumber: function (value) {
            this.set("districtNumber", value);
        },
        setParcelNumber: function (value) {
            this.set("parcelNumber", value);
        },
        validateParcelNumber: function () {
            if (this.isValid()) {
                $("#parcelField + .text-danger").html("");
                $("#parcelField").parent().removeClass("has-error");
                EventBus.trigger("alert:remove");
                this.sendRequest("StoredQuery_ID=Flurstueck&gemarkung=" + this.get("districtNumber") + "&flurstuecksnummer=" + this.get("parcelNumber"), this.getParcel);
            }
            else {
                $("#parcelField + .text-danger").html("");
                $("#parcelField").after("<span class='text-danger'><small>" + this.validationError + "</small></span>");
                $("#parcelField").parent().addClass("has-error");
            }
        },
        sendRequest: function (data, successFunction) {
            $.ajax({
                url: this.get("gazetteerURL"),
                data: data,
                context: this,
                success: successFunction,
                timeout: 6000,
                error: function () {
                    EventBus.trigger("alert", "Dienst ist zurzeit nicht erreichbar. Bitte versuchen Sie es später nochmal.");
                }
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
