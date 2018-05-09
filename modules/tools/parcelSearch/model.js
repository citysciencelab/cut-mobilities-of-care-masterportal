define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        _String = require("underscore.string"),
        ParcelSearch;

        ParcelSearch = Backbone.Model.extend({
        defaults: {
            "isCollapsed": undefined,
            "isCurrentWin": undefined,
            "countryNumber": "02", // Kennzeichen des Landes. Wird für den Report benötigt um das Flurstückskennzeichen zusammmenzubauen
            "fetched": false, // initiales Laden der JSON
            "serviceId": "",
            "reportServiceId": "",
            "serviceURL": "", // Flurstücks-Gazetteer-URL
            "storedQueryID": null, // StoredQueryID, die im Request angesprochen werden soll.
            "districts": {}, // Object mit allen Gemarkungen {{"name": "id"}, {"name2": "id2"}, ...}
            "cadastralDistricts": {}, // Object mit allen Fluren {{"id1": ["name1", "name2"]}, {"id2": ["name1", "name2"]}, ...}
            "districtNumber": "0", // default Gemarkung
            "cadastralDistrictField": false, // sollen Fluren genutzt werden? Wird automatisch beim parsen ermittelt.
            "cadastralDistrictNumber": "0", // default Flur
            "parcelDenominatorField": false, // sollen Flurstücksnenner verwendet werden? Aus config
            "parcelNumber": "", // default Flurstücksnummer
            "parcelDenominatorNumber": "0", // default Flurstücksnenner,
            "createReport": false, // soll Berichts-Funktionalität gestartet werden? Aus Config.json
            "parcelFound": false // flag für den Bericht. Bericht wird nur abgefragt wenn Flurstück existiert
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
            this.listenTo(Radio.channel("ParcelSearch"), {
                "createReport": this.createReport
            });
            this.setDefaults();
        },
        /*
         * wird getriggert, wenn ein Tool in der Menüleiste geklickt wird. Übergibt die Konfiguration der parcelSearch aus args an readConfig().
         */
        setStatus: function (args) {
            if (args[2].getId() === "parcelSearch") {
                    this.setIsCollapsed(args[1]);
                    this.setIsCurrentWin(args[0]);
            }
            else {
                this.setIsCurrentWin(false);
            }
        },
        setDefaults: function () {
            var config = Radio.request("Parser", "getItemByAttributes", {id: "parcelSearch"}),
                restService,
                serviceURL;

            _.each(config, function (val, key) {
                this.set(key, val);
            }, this);

            restService = this.getServiceId() ? Radio.request("RestReader", "getServiceById", this.getServiceId()) : null,
            serviceURL = restService && restService.get("url") ? restService.get("url") : null;

            this.setServiceURL(serviceURL);
            // lade json und Konfiguration
            if (serviceURL && this.getConfigJSON() && this.getStoredQueryID()) {
                this.loadConfiguration(this.getConfigJSON());
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
                complete: function () {
                    Radio.trigger("Util", "hideLoader");
                },
                beforeSend: function () {
                    Radio.trigger("Util", "showLoader");
                }
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
            this.setDistricts(districts);
            if (_.values(cadastralDistricts).length > 0) {
                this.setCadastralDistricts(cadastralDistricts);
                this.setCadastralDistrictField(true);
            }
            this.setFetched(true);
        },
        createReport: function (flurstueck, gemarkung) {
            var flurst_kennz,
                jasperService = Radio.request("RestReader", "getServiceById", this.getReportServiceId()),
                params = _.isUndefined(jasperService) === false ? jasperService.get("params") : undefined,
                url = _.isUndefined(jasperService) === false ? jasperService.get("url") + "?" : undefined;

            // setze flurst_nummer und gemarkung aus gfi Aufruf
            if (_.isUndefined(flurstueck) === false) {
                this.setParcelNumber(flurstueck);
                this.setDistrictNumber(gemarkung);
            }
            flurst_kennz = this.createFlurstKennz();

            // prüfe ob es ein Flurstück gibt
            this.sendRequest();
            if (this.getParcelFound() === true) {
                if (_.isUndefined(url) === false && _.isUndefined(params) === false) {
                    params.flurstueckskennzeichen = flurst_kennz;
                    url = this.buildUrl(url, params);
                    window.open(url, "_blank");
                }
                else {
                    Radio.trigger("Alert", "alert", {text: "Die Konfiguration der Flurstückssuche ist fehlerhaft. Bitte wenden Sie sich an den Support", kategorie: "alert-info"});
                }
            }
        },
        buildUrl: function (url, params) {
            _.each(params, function (val, key) {
                var andSymbol = "&";

                url += key + "=" + String(val) + andSymbol;
            });
            // if params is empty object
            if (url.charAt(url.length - 1) !== "?") {
                url = url.slice(0, -1);
            }
            return url;

        },
        createFlurstKennz: function () {
            var land = this.getCountryNumber(),
                gemarkung = this.getDistrictNumber(),
                flurst_nr = _String.lpad(this.getParcelNumber(), 5, "0");

            return land + gemarkung + "___" + flurst_nr + "______";
        },
        sendRequest: function () {
            var storedQuery = "&StoredQuery_ID=" + this.getStoredQueryID(),
                gemarkung = "&gemarkung=" + this.getDistrictNumber(),
                flur = this.getCadastralDistrictField() === true ? "&flur=" + this.getCadastralDistrictNumber() : "",
                parcelNumber = "&flurstuecksnummer=" + _String.lpad(this.getParcelNumber(), 5, "0"),
                parcelDenominatorNumber = this.getParcelDenominatorField() === true ? "&flurstuecksnummernenner=" + _String.lpad(this.getParcelDenominatorNumber(), 3, "0") : "",
                data = storedQuery + gemarkung + flur + parcelNumber + parcelDenominatorNumber;

            $.ajax({
                url: this.getServiceURL(),
                data: data,
                context: this,
                success: this.getParcel,
                timeout: 6000,
                async: false,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Flurstücksabfrage derzeit nicht möglich!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                },
                complete: function () {
                    Radio.trigger("Util", "hideLoader");
                },
                beforeSend: function () {
                    Radio.trigger("Util", "showLoader");
                }
            });
        },
        getParcel: function (data) {
            var member = $("wfs\\:member,member", data)[0];

            if (!member || member.length === 0) {
                var parcelNumber = _String.lpad(this.getParcelNumber(), 5, "0"),
                    parcelDenominatorNumber = this.getParcelDenominatorField() === true ? " / " + _String.lpad(this.getParcelDenominatorNumber(), 3, "0") : "";

                this.setParcelFound(false);
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
                }).each(function () {
                    _.extend(attributes, _.object([this.nodeName.split(":")[1]], [this.textContent]));
                });
                this.setParcelFound(true);
                Radio.trigger("MapMarker", "zoomTo", {type: "Parcel", coordinate: coordinate});
                Radio.trigger("ParcelSearch", "parcelFound", attributes);
            }
        },

        setDistrictNumber: function (value) {
            this.set("districtNumber", value);
        },

        setCadastralDistrictNumber: function (value) {
            this.set("cadastralDistrictNumber", value);
        },

        setParcelDenominatorNumber: function (value) {
            this.set("parcelDenominatorNumber", value);
        },

        // getter for isCollapsed
        getIsCollapsed: function () {
            return this.get("isCollapsed");
        },
        // setter for isCollapsed
        setIsCollapsed: function (value) {
            this.set("isCollapsed", value);
        },

        // getter for isCurrentWin
        getIsCurrentWin: function () {
            return this.get("isCurrentWin");
        },
        // setter for isCurrentWin
        setIsCurrentWin: function (value) {
            this.set("isCurrentWin", value);
        },

        // getter for parcelDenominatorField
        getParcelDenominatorField: function () {
            return this.get("parcelDenominatorField");
        },
        // setter for parcelDenominatorField
        setParcelDenominatorField: function (value) {
            this.set("parcelDenominatorField", value);
        },

        // getter for storedQueryID
        getStoredQueryID: function () {
            return this.get("storedQueryID");
        },
        // setter for storedQueryID
        setStoredQueryID: function (value) {
            this.set("storedQueryID", value);
        },

        // getter for serviceURL
        getServiceURL: function () {
            return this.get("serviceURL");
        },
        // setter for serviceURL
        setServiceURL: function (value) {
            this.set("serviceURL", value);
        },
        // setter for createReport
        setCreateReport: function (value) {
            this.set("createReport", value);
        },

        // getter for districts
        getDistricts: function () {
            return this.get("districts");
        },
        // setter for districts
        setDistricts: function (value) {
            this.set("districts", value);
        },

        // getter for cadastralDistricts
        getCadastralDistricts: function () {
            return this.get("cadastralDistricts");
        },
        // setter for cadastralDistricts
        setCadastralDistricts: function (value) {
            this.set("cadastralDistricts", value);
        },

        // getter for cadastralDistrictsField
        getCadastralDistrictsField: function () {
            return this.get("cadastralDistrictsField");
        },
        // setter for cadastralDistrictsField
        setCadastralDistrictsField: function (value) {
            this.set("cadastralDistrictsField", value);
        },

        // getter for fetched
        getFetched: function () {
            return this.get("fetched");
        },
        // setter for fetched
        setFetched: function (value) {
            this.set("fetched", value);
        },

        // getter for districtNumber
        getDistrictNumber: function () {
            return this.get("districtNumber");
        },

        // getter for cadastralDistrictField
        getCadastralDistrictField: function () {
            return this.get("cadastralDistrictField");
        },
        // setter for getCadastralDi
        setCadastralDistrictField: function (value) {
            this.set("cadastralDistrictField", value);
        },

        // getter for parcelNumber
        getParcelNumber: function () {
            return this.get("parcelNumber");
        },
        setParcelNumber: function (value) {
            this.set("parcelNumber", value);
        },

        // getter for parcelFound
        getParcelFound: function () {
            return this.get("parcelFound");
        },
        // setter for parcelFound
        setParcelFound: function (value) {
            this.set("parcelFound", value);
        },

        // getter for countryNumber
        getCountryNumber: function () {
            return this.get("countryNumber");
        },

        // getter for reportServiceId
        getReportServiceId: function () {
            return this.get("reportServiceId");
        },
        // setter for reportServiceId
        setReportServiceId: function (value) {
            this.set("reportServiceId", value);
        },
        // getter for serviceId
        getServiceId: function () {
            return this.get("serviceId");
        },
        // setter for serviceId
        setServiceId: function (value) {
            this.set("serviceId", value);
        },
        // getter for configJSON
        getConfigJSON: function () {
            return this.get("configJSON");
        },
        // setter for configJSON
        setConfigJSON: function (value) {
            this.set("configJSON", value);
        }
    });

    return ParcelSearch;
});
