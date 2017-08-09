define([
    "backbone",
    "backbone.radio",
    "underscore.string",
    "modules/core/util"
], function (Backbone, Radio, _String, Util) {

    var ParcelSearch = Backbone.Model.extend({
        defaults: {
            "fetched": false, // initiales Laden der JSON
            "serviceURL": "", // Flurstücks-Gazetteer-URL
            "storedQueryID": "", // StoredQueryID, die im Request angesprochen werden soll.
            "districts": {}, // Object mit allen Gemarkungen {{"name": "id"}, {"name2": "id2"}, ...}
            "cadastralDistricts": {}, // Object mit allen Fluren {{"id1": ["name1", "name2"]}, {"id2": ["name1", "name2"]}, ...}
            "districtNumber": "0", // default Gemarkung
            "cadastralDistrictField": false, // sollen Fluren genutzt werden? Wird automatisch beim parsen ermittelt.
            "cadastralDistrictNumber": "0", // default Flur
            "parcelDenominatorField": false, // sollen Flurstücksnenner verwendet werden? Aus config
            "parcelNumber": "", // default Flurstücksnummer
            "parcelDenominatorNumber": "0" // default Flurstücksnenner
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
        },
        /*
         * wird getriggert, wenn ein Tool in der Menüleiste geklickt wird. Übergibt die Konfiguration der parcelSearch aus args an readConfig().
         */
        setStatus: function (args) {
            if (args[2].getId() === "parcelSearch") {
                if (this.get("fetched") === false) {
                    this.readConfig(args[2].attributes);
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
         * liest die übergebene Konfiguration, prüft und initiiert das Lesen der gemarkung.json
         */
        readConfig: function (psconfig) {
            var serviceId = psconfig.serviceId ? psconfig.serviceId : null,
                restService = serviceId ? Radio.request("RestReader", "getServiceById", serviceId) : null,
                serviceURL = restService && restService.get("url") ? restService.get("url") : null,
                configJSON = psconfig.configJSON ? psconfig.configJSON : null,
                parcelDenominatorField = psconfig.parcelDenominator ? psconfig.parcelDenominator : false,
                storedQueryID = psconfig.StoredQueryID ? psconfig.StoredQueryID : null;

            this.set("parcelDenominatorField", parcelDenominatorField);
            this.set("storedQueryID", storedQueryID);
            this.set("serviceURL", serviceURL);

            // lade json und Konfiguration
            if (serviceURL && configJSON && storedQueryID) {
                this.loadConfiguration(configJSON);
            }
            else {
                Radio.trigger("Alert", "alert", {text: "<strong>Invalid parcelSearch configuration!</strong>", kategorie: "alert-danger"});
                Radio.trigger("Window", "closeWin");
            }
        },
        /*
         * liest die gemarkung.json ein. Anschließend wird parse gestartet.
         */
        loadConfiguration: function (configJSON) {
            this.fetch({
                url: configJSON,
                cache: false,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Konfiguration der Flurstückssuche konnte nicht geladen werden!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                    Radio.trigger("Window", "closeWin");
                },
                complete: Util.hideLoader,
                beforeSend: Util.showLoader
            });
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
                if (_.has(value, "flur") && _.isArray(value.flur) && value.flur.length > 0) {
                    _.extend(cadastralDistricts, _.object([value.id], [value.flur]));
                }
            }, this);
            this.set("districts", districts);
            if (_.values(cadastralDistricts).length > 0) {
                this.set("cadastralDistricts", cadastralDistricts);
                this.set("cadastralDistrictField", true);
            }
            this.set("fetched", true);
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
        sendRequest: function () {
            var storedQuery = "&StoredQuery_ID=" + this.get("storedQueryID"),
                gemarkung = "&gemarkung=" + this.get("districtNumber"),
                flur = this.get("cadastralDistrictField") === true ? "&flur=" + this.get("cadastralDistrictNumber") : "",
                parcelNumber = "&flurstuecksnummer=" + _String.lpad(this.get("parcelNumber"), 5, "0"),
                parcelDenominatorNumber = this.get("parcelDenominatorField") === true ? "&flurstuecksnummernenner=" + _String.lpad(this.get("parcelDenominatorNumber"), 3, "0") : "",
                data = storedQuery + gemarkung + flur + parcelNumber + parcelDenominatorNumber;

            $.ajax({
                url: this.get("serviceURL"),
                data: data,
                context: this,
                success: this.getParcel,
                timeout: 6000,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Flurstücksabfrage derzeit nicht möglich!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                },
                complete: Util.hideLoader,
                beforeSend: Util.showLoader
            });
        },
        getParcel: function (data) {
            var member = $("wfs\\:member,member", data)[0];

            if (!member || member.length === 0) {
                var parcelNumber = _String.lpad(this.get("parcelNumber"), 5, "0"),
                    parcelDenominatorNumber = this.get("parcelDenominatorField") === true ? " / " + _String.lpad(this.get("parcelDenominatorNumber"), 3, "0") : "";

                Radio.trigger("Alert", "alert", {text: "Es wurde kein Flurstück mit der Nummer " + parcelNumber + parcelDenominatorNumber + " gefunden.", kategorie: "alert-info"});
                Radio.trigger("ParcelSearch", "noParcelFound");
            }
            else {
                var position = $(member).find("gml\\:pos, pos")[0] ? $(member).find("gml\\:pos, pos")[0].textContent.split(" ") : null,
                    coordinate = position ? [parseFloat(position[0]), parseFloat(position[1])] : null,
                    attributes = coordinate ? _.object(["coordinate"], [coordinate]) : {},
                    geoExtent = $(member).find("iso19112\\:geographicExtent, geographicExtent")[0] ? $(member).find("iso19112\\:geographicExtent, geographicExtent")[0] : null,
                    attributes = geoExtent ? _.extend(attributes, _.object(["geographicExtent"], [geoExtent])) : attributes;

                $(member).find("*").filter(function () {
                    return this.nodeName.indexOf("dog") !== -1 || this.nodeName.indexOf("gages") !== -1;
                }).each(function (i, obj) {
                    _.extend(attributes, _.object([this.nodeName.split(":")[1]], [this.textContent]));
                });
                Radio.trigger("MapMarker", "zoomTo", {type: "Parcel", coordinate: coordinate});
                Radio.trigger("ParcelSearch", "parcelFound", attributes);
            }
        }
    });

    return ParcelSearch;
});
