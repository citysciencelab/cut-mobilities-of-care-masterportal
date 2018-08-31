define(function (require) {
    var ol = require("openlayers"),
        $ = require("jquery"),
        RoutingModel;

    RoutingModel = Backbone.Model.extend({
        defaults: {
            bkgSuggestURL: null,
            bkgGeosearchURL: null,
            viomRoutingURL: null,
            viomProviderID: null,
            description: null,
            epsgCode: null,
            endDescription: null,
            routingtime: "",
            routingdate: "",
            fromCoord: "",
            toCoord: "",
            fromList: [],
            toList: [],
            startAdresse: "",
            zielAdresse: "",
            bbox: null,
            routelayer: null,
            mhpOverlay: "",
            isGeolocationPossible: Radio.request("geolocation", "isGeoLocationPossible") === true
        },
        initialize: function (attr) {
            this.setViomRoutingURL(attr.viomRoutingID);
            this.setViomProviderID(attr.viomRoutingID);
            this.setBkgSuggestURL(attr.bkgSuggestID);
            this.setBkgGeosearchURL(attr.bkgGeosearchID);
            this.setEpsgCode();
            this.setBbox(attr.bbox);

            if (_.isString(this.get("bkgSuggestURL")) && _.isString(this.get("bkgGeosearchURL")) && _.isString(this.get("viomRoutingURL")) && _.isString(this.get("viomProviderID"))) {
                Radio.on("Window", "winParams", this.setStatus, this);
                Radio.on("geolocation", "position", this.setStartpoint, this); // asynchroner Prozess
                Radio.on("geolocation", "changedGeoLocationPossible", this.setIsGeolocationPossible, this);
            }
            else {
                console.error("Konfiguration des Viom Routenplaners fehlerhaft.");
            }
        },
        setStartpoint: function (geoloc) {
            this.set("fromCoord", geoloc);
            this.setCenter(geoloc);
            this.set("startAdresse", "aktueller Standpunkt");
        },

        setStatus: function (args) { // Fenstermanagement
            if (args[2].get("id") === "routing") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        deleteRouteFromMap: function () {
            if (!_.isNull(this.get("routelayer"))) { // Funktion WÜRDE bei jeder Window-Aktion ausgeführt
                this.removeOverlay();
                Radio.trigger("Map", "removeLayer", this.get("routelayer"));
                this.set("routelayer", null);
                this.set("description", null);
                this.set("endDescription", null);
                this.set("sumLength", "");
                this.set("sumTime", "");
            }
        },
        suggestByBKG: function (value, target) {
            var arr = value.split(/,| /),
                plz = _.filter(arr, function (val) {
                    return val.match(/^([0]{1}[1-9]{1}|[1-9]{1}[0-9]{1})[0-9]{3}$/);
                }),
                hsnr = _.filter(arr, function (val, index, list) {
                    var patt = /^\D*$/,
                        preString = patt.test(list[index - 1]),
                        isHouseNr = false;

                    if (index >= 1) {
                        if (preString) { // vorher ein String
                            isHouseNr = val.match(/^[0-9]{1,4}\D?$/);
                        }
                    }
                    return isHouseNr;
                }),
                query = "&query=" + _.without(arr, plz[0], hsnr[0]),
                bbox = _.isNull(this.get("bbox")) === false ? this.get("bbox") : "",
                filter = "";

            if (plz.length === 1 && hsnr.length === 1) {
                filter = "&filter=(plz:" + plz + ") AND (typ:Haus) AND haus:(" + hsnr + "*)";
            }
            else if (plz.length === 1 && hsnr.length !== 1) {
                filter = "&filter=(plz:" + plz + ") AND (typ:Strasse OR typ:Ort OR typ:Geoname)";
            }
            else if (plz.length !== 1 && hsnr.length === 1) {
                filter = "&filter=(typ:Haus) AND haus:(" + hsnr + "*)";
            }
            else {
                filter = "&filter=(typ:Strasse OR typ:Ort OR typ:Geoname)";
            }

            query = encodeURI(query);
            $.ajax({
                url: this.get("bkgSuggestURL"),
                data: "count=5" + query + bbox + filter,
                context: this, // das Model
                async: true,
                type: "GET",
                success: function (data) {
                    this.suggestSuccess(data, target);
                },
                error: function (error) {
                    console.error("Adressabfrage fehlgeschlagen: " + error.statusText);
                },
                timeout: 3000
            });
        },

        suggestSuccess: function (data, target) {
            var treffer = [];

            _.each(data, function (strasse) {
                treffer.push([strasse.suggestion, strasse.highlighted]);
            });
            if (target === "start") {
                this.set("fromList", treffer);
            }
            else {
                this.set("toList", treffer);
            }
        },

        geosearchByBKG: function (value, target) {
            $.ajax({
                url: this.get("bkgGeosearchURL"),
                data: this.get("epsgCode") + "&count=1&outputformat=json&query=" + encodeURI(value),
                context: this, // das model
                async: true,
                type: "GET",
                success: function (data) {
                    this.geosearchSuccess(data, target);
                },
                error: function (error) {
                    console.error("Adressabfrage fehlgeschlagen: " + error.statusText);
                    Radio.trigger("Alert", "alert", {text: "Die Adressabfrage ist fehlgeschlagen. Bitte versuchen Sie es später erneut.", kategorie: "alert-warning"});
                },
                timeout: 3000
            });
        },

        geosearchSuccess: function (data, target) {
            if (data.features[0] && data.features[0].geometry) {
                if (target === "start") {
                    this.set("fromCoord", data.features[0].geometry.coordinates);
                    this.set("fromList", "");
                    this.set("startAdresse", data.features[0].properties.text);
                }
                else {
                    this.set("toCoord", data.features[0].geometry.coordinates);
                    this.set("toList", "");
                    this.set("zielAdresse", data.features[0].properties.text);
                }
                this.setCenter(data.features[0].geometry.coordinates);
            }
        },

        setCenter: function (newCoord) {
            if (newCoord && newCoord.length === 2) {
                Radio.trigger("MapView", "setCenter", newCoord, 10);
            }
        },
        requestRoute: function () {
            var request = "PROVIDERID=" + this.get("viomProviderID") + "&REQUEST=VI-ROUTE&START-X=" + this.get("fromCoord")[0] + "&START-Y=" + this.get("fromCoord")[1] + "&DEST-X=" + this.get("toCoord")[0] + "&DEST-Y=" + this.get("toCoord")[1] + "&USETRAFFIC=TRUE",
                splitter,
                utcHour,
                utcMinute;

            // zählt das Anfordern einer Routenberechnung
            Radio.trigger("ClickCounter", "calcRoute");


            /* Erwartete Übergabeparameter:
            *  routingtime [hh:mm]
            *  routingdate [yyyy-mm-dd]
            */
            if (this.get("routingtime") !== "" && this.get("routingdate") !== "") {
                splitter = this.get("routingtime").split(":");
                utcHour = (parseFloat(splitter[0]) + (new Date().getTimezoneOffset() / 60)).toString();
                utcMinute = parseFloat(splitter[1]);
                request = request + "&STARTTIME=" + this.get("routingdate") + "T" + utcHour + ":" + utcMinute + ":00.000Z";
            }

            $.ajax({
                beforeSend: function () {
                    Radio.trigger("Util", "showLoader");
                },
                url: this.get("viomRoutingURL").indexOf(window.location.host) !== -1 ? this.get("viomRoutingURL") : Radio.request("Util", "getProxyURL", this.get("viomRoutingURL")),
                data: request,
                async: true,
                context: this,
                success: this.routingSuccess,
                complete: function () {
                    Radio.trigger("Util", "hideLoader");
                },
                error: function () {
                    this.set("description", null);
                    this.set("endDescription", null);
                    Radio.trigger("Alert", "alert", {text: "Bei der Routenberechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.", kategorie: "alert-warning"});
                    console.error("Fehler bei Routenberechnung.");
                }
            });
        },

        routingSuccess: function (data) {
            var geoJsonFormat = new ol.format.GeoJSON(),
                olFeature = geoJsonFormat.readFeature(data),
                vectorlayer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [olFeature]
                    }),
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: "blue",
                            width: 5
                        })
                    })
                });

            $("#loader").hide();
            vectorlayer.id = "routenplanerroute";
            this.set("routelayer", vectorlayer);
            Radio.trigger("Map", "addLayer", vectorlayer);
            this.set("endDescription", olFeature.get("EndDescription"));
            this.set("sumLength", (olFeature.get("Distance") / 1000).toFixed(1).toString().replace(".", ","));
            this.set("sumTime", Math.round(olFeature.get("Duration") / 60).toString());
            this.set("description", olFeature.get("RouteDescription"));
            Radio.trigger("Map", "zoomToExtent", olFeature.getGeometry().getExtent());
            this.addOverlay(olFeature);
        },

        removeOverlay: function () {
            if (this.get("mhpOverlay") !== "") {
                Radio.trigger("Map", "removeOverlay", this.get("mhpOverlay"));
                this.set("mhpOverlay", "");
            }
        },
        addOverlay: function (olFeature) {
            var html = "<div id='routingoverlay' class=''>",
                position = olFeature.getGeometry().getLastCoordinate();

            html += "<span class='glyphicon glyphicon-flag'></span>";
            html += "<span>" + olFeature.get("EndDescription").substr(olFeature.get("EndDescription").indexOf(". ") + 1) + "</span>";
            html += "</div>";

            $("#map").append(html);
            this.set("mhpOverlay", new ol.Overlay({element: $("#routingoverlay")[0]}));
            this.get("mhpOverlay").setPosition([position[0] + 7, position[1] - 7]);
            Radio.trigger("Map", "addOverlay", this.get("mhpOverlay"));
        },

        // setter for isGeolocationPossible
        setIsGeolocationPossible: function (value) {
            this.set("isGeolocationPossible", value);
        },

        /*
        * setter for bkgSuggestURL
        * @param {string} value bkgSuggestID
        * @returns {void}
        */
        setBkgSuggestURL: function (value) {
            var service = Radio.request("RestReader", "getServiceById", value);

            this.set("bkgSuggestURL", service.get("url"));
        },

        /*
        * setter for bkgGeosearchURL
        * @param {string} value bkgGeosearchID
        * @returns {void}
        */
        setBkgGeosearchURL: function (value) {
            var service = Radio.request("RestReader", "getServiceById", value);

            this.set("bkgGeosearchURL", service.get("url"));
        },

        /*
        * setter for viomRoutingURL
        * @param {object} value viomRoutingID
        * @returns {void}
        */
        setViomRoutingURL: function (value) {
            var service = Radio.request("RestReader", "getServiceById", value);

            this.set("viomRoutingURL", service.get("url"));
        },

        /*
        * setter for viomProviderID
        * @param {string} value viomRoutingID
        * @returns {void}
        */
        setViomProviderID: function (value) {
            var service = Radio.request("RestReader", "getServiceById", value);

            this.set("viomProviderID", service.get("providerID"));
        },

        /*
        * setter for epsgCode
        * @returns {void}
        */
        setEpsgCode: function () {
            var code = Radio.request("MapView", "getProjection").getCode(),
                value = code ? "&srsName=" + code : "";

            this.set("epsgCode", value);
        },

        /*
        * setter for bbox
        * @param {number[]} value BBOX-Array
        * @returns {void}
        */
        setBbox: function (value) {
            var epsgCode = this.get("epsgCode"),
                bbox = value && epsgCode !== "" ? "&bbox=" + value + epsgCode : null;

            this.set("bbox", bbox);
        }
    });

    return RoutingModel;
});
