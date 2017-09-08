define([
    "backbone",
    "backbone.radio",
    "openlayers"
], function (Backbone, Radio, ol) {

    var RoutingModel = Backbone.Model.extend({
        defaults: {
            bkgSuggestURL: "",
            bkgGeosearchURL: "",
            viomRoutingURL: "",
            viomProviderID: "",
            description: "",
            endDescription: "",
            routingtime: "",
            routingdate: "",
            fromCoord: "",
            toCoord: "",
            fromList: [],
            toList: [],
            startAdresse: "",
            zielAdresse: "",
            bbox: "",
            routelayer: "",
            mhpOverlay: "",
            isGeolocationPossible: Radio.request("geolocation", "isGeoLocationPossible") === true ? true : false
        },
        initialize: function () {
            Radio.on("Window", "winParams", this.setStatus, this);
            Radio.on("geolocation", "position", this.setStartpoint, this); // asynchroner Prozess
            Radio.on("geolocation", "changedGeoLocationPossible", this.setIsGeolocationPossible, this);
        },
        setStartpoint: function (geoloc) {
            this.set("fromCoord", geoloc);
            this.setCenter(geoloc);
            this.set("startAdresse", "aktueller Standpunkt");
        },
        setStatus: function (args) { // Fenstermanagement
            if (args[2].getId() === "routing") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                var viomRoutingID = Radio.request("RestReader", "getServiceById", args[2].get("viomRoutingID")),
                    bkgSuggestID = Radio.request("RestReader", "getServiceById", args[2].get("bkgSuggestID")),
                    bkgGeosearchID = Radio.request("RestReader", "getServiceById", args[2].get("bkgGeosearchID")),
                    epsgCode = Radio.request("MapView", "getProjection").getCode() ? "&srsName=" + Radio.request("MapView", "getProjection").getCode() : "",
                    bbox = args[2].get("bbox") && epsgCode !== "" ? "&bbox=" + args[2].get("bbox") + epsgCode : null;

                this.set("bkgSuggestURL", bkgSuggestID.get("url"));
                this.set("bkgGeosearchURL", bkgGeosearchID.get("url"));
                this.set("viomRoutingURL", viomRoutingID.get("url"));
                this.set("viomProviderID", viomRoutingID.get("providerID"));
                this.set("bbox", bbox);
                this.set("epsgCode", epsgCode);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        deleteRouteFromMap: function () {
            if (this.get("routelayer") !== "") { // Funktion WÜRDE bei jeder Window-Aktion ausgeführt
                this.removeOverlay();
                Radio.trigger("Map", "removeLayer", this.get("routelayer"));
                this.set("routelayer", "");
                this.set("description", "");
                this.set("endDescription", "");
                this.set("sumLength", "");
                this.set("sumTime", "");
            }
        },
        suggestByBKG: function (value, target) {
            if (value.length < 3) {
                return;
            }
            var arr = value.split(/,| /),
                plz = _.filter(arr, function (val) {
                    return val.match(/^([0]{1}[1-9]{1}|[1-9]{1}[0-9]{1})[0-9]{3}$/);
                }),
                hsnr = _.filter(arr, function (val, index, arr) {
                    if (index >= 1) {
                        var patt = /^\D*$/,
                            preString = patt.test(arr[index - 1]);

                        if (preString) { // vorher ein String
                            return val.match(/^[0-9]{1,4}\D?$/);
                        }
                    }
                }),
                query = "&query=" + _.without(arr, plz[0], hsnr[0]),
                bbox = _.isNull(this.get("bbox")) === false ? this.get("bbox") : "",
                filter = plz.length === 1 && hsnr.length === 1 ? "&filter=(plz:" + plz + ") AND (typ:Haus) AND haus:(" + hsnr + "*)" :
                        plz.length === 1 && hsnr.length !== 1 ? "&filter=(plz:" + plz + ") AND (typ:Strasse OR typ:Ort OR typ:Geoname)" :
                        plz.length !== 1 && hsnr.length === 1 ? "&filter=(typ:Haus) AND haus:(" + hsnr + "*)" : " &filter=(typ:Strasse OR typ:Ort OR typ:Geoname)";

            $.ajax({
                url: this.get("bkgSuggestURL"),
                data: "count=5" + query + bbox + filter,
                context: this, // das Model
                async: true,
                type: "GET",
                success: function (data) {
                    try {
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
                    }
                    catch (error) {
                        Radio.trigger("Alert", "alert", {text: "Adressabfrage unverständlich", kategorie: "alert-warning"});
                    }
                },
                error: function (error) {
                    Radio.trigger("Alert", "alert", {text: "Adressabfrage fehlgeschlagen: " + error.statusText, kategorie: "alert-warning"});
                },
                timeout: 3000
            });
        },
        geosearchByBKG: function (value, target) {
            $.ajax({
                url: this.get("bkgGeosearchURL"),
                data: this.get("epsgCode") + "&count=1&outputformat=json&query=" + value,
                context: this, // das model
                async: true,
                type: "GET",
                success: function (data) {
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
                error: function (error) {
                    Radio.trigger("Alert", "alert", {text: "Adressabfrage fehlgeschlagen: " + error.statusText, kategorie: "alert-warning"});
                },
                timeout: 3000
            });
        },
        setCenter: function (newCoord) {
            if (newCoord && newCoord.length === 2) {
                Radio.trigger("MapView", "setCenter", newCoord, 10);
            }
        },
        requestRoute: function () {
            // zählt das Anfordern einer Routenberechnung
            Radio.trigger("ClickCounter", "calcRoute");

            var request = "PROVIDERID=" + this.get("viomProviderID") + "&REQUEST=VI-ROUTE&START-X=" + this.get("fromCoord")[0] + "&START-Y=" + this.get("fromCoord")[1] + "&DEST-X=" + this.get("toCoord")[0] + "&DEST-Y=" + this.get("toCoord")[1] + "&USETRAFFIC=TRUE";
            /* Erwartete Übergabeparameter:
            *  routingtime [hh:mm]
            *  routingdate [yyyy-mm-dd]
            */
            if (this.get("routingtime") !== "" && this.get("routingdate") !== "") {
                var splitter = this.get("routingtime").split(":"),
                    utcHour = (parseFloat(splitter[0]) + new Date().getTimezoneOffset() / 60).toString(),
                    utcMinute = parseFloat(splitter[1]);

                request = request + "&STARTTIME=" + this.get("routingdate") + "T" + utcHour + ":" + utcMinute + ":00.000Z";
            }
            $("#loader").show();
            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("viomRoutingURL")),
                data: request,
                async: true,
                context: this,
                success: function (data) {
                    $("#loader").hide();
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
                error: function () {
                    $("#loader").hide();
                    this.set("description", "");
                    this.set("endDescription", "");
                    Radio.trigger("Alert", "alert", {text: "Fehlermeldung bei Routenberechung", kategorie: "alert-warning"});
                }
            });
        },
        removeOverlay: function () {
            if (this.get("mhpOverlay") !== "") {
                Radio.trigger("Map", "removeOverlay", this.get("mhpOverlay"));
                this.set("mhpOverlay", "");
            }
        },
        addOverlay: function (olFeature) {
            var html = "<div id='routingoverlay' class=''>",
                position = olFeature.getGeometry().getLastCoordinate(),
                html = html + "<span class='glyphicon glyphicon-flag'></span>",
                html = html + "<span>" + olFeature.get("EndDescription").substr(olFeature.get("EndDescription").indexOf(". ") + 1) + "</span>",
                html = html + "</div>";

            $("#map").append(html);
            this.set("mhpOverlay", new ol.Overlay({ element: $("#routingoverlay")[0]}));
            this.get("mhpOverlay").setPosition([position[0] + 7, position[1] - 7]);
            Radio.trigger("Map", "addOverlay", this.get("mhpOverlay"));
        },
        // getter for isGeolocationPossible
        getIsGeolocationPossible: function () {
            return this.get("isGeolocationPossible");
        },
        // setter for isGeolocationPossible
        setIsGeolocationPossible: function (value) {
            this.set("isGeolocationPossible", value);
        }
    });

    return new RoutingModel();
});
