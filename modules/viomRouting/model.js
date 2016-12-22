define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config"
], function (Backbone, Radio, ol, Config) {

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
            mhpOverlay: ""
        },
        initialize: function () {
            if (Config.view.extent && _.isArray(Config.view.extent) && Config.view.extent.length === 4) {
                this.set("bbox", "&bbox=" + Config.view.extent[0] + "," + Config.view.extent[1] + "," + Config.view.extent[2] + "," + Config.view.extent[3] + "&srsName=" + Config.view.epsg);
            }

            Radio.on("Window", "winParams", this.setStatus, this);
            Radio.on("geolocation", "position", this.position, this);
        },
        /*
        * Übernimmt die über Radio übermittelte Koordinate
        */
        position: function (geoloc) {
            if (this.get("fromCoord") === "") {
                this.set("fromCoord", geoloc[0]);
                this.set("startAdresse", "aktueller Standpunkt");
            }
        },
        setStatus: function (args) { // Fenstermanagement
            if (args[2].getId() === "routing") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                var viomRoutingID = Radio.request("RestReader", "getServiceById", args[2].get("viomRoutingID")),
                    bkgSuggestID = Radio.request("RestReader", "getServiceById", args[2].get("bkgSuggestID")),
                    bkgGeosearchID = Radio.request("RestReader", "getServiceById", args[2].get("bkgGeosearchID"));

                this.set("bkgSuggestURL", bkgSuggestID[0].get("url"));
                this.set("bkgGeosearchURL", bkgGeosearchID[0].get("url"));
                this.set("viomRoutingURL", viomRoutingID[0].get("url"));
                this.set("viomProviderID", viomRoutingID[0].get("providerID"));
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
//        setMap: function (map) {
//            this.set("map", map);
//        },
        deleteRouteFromMap: function () {
            this.removeOverlay();
            Radio.trigger("Map", "removeLayer", this.get("routelayer"));
            this.set("routelayer", "");
//            var map = this.get("map");
//
//            this.removeOverlay();
//            var layer = Radio.trigger("map", )
//            _.each(map.getLayers(), function (layer) {
//                if (_.isArray(layer)) {
//                    _.each(layer, function (childlayer) {
//                        if (childlayer.id && childlayer.id === "routenplanerroute") {
//                             map.removeLayer(childlayer);
//                        }
//                    });
//                }
//            });
        },
        suggestByBKG: function (value, target) {
            if (value.length < 4) {
                return;
            }
            else {
                var parts = value.split(/[.,\/ -]/);

                if (this.get("bbox") !== "") {
                    value = value + this.get("bbox");
                }
                if (value.indexOf("&filter=") === -1) {
                    var plz = _.find(parts, function (val) {
                        return parseInt(val, 10) && parseInt(val, 10) >= 10000 && parseInt(val, 10) <= 99999;
                    }),
                    hsnr = _.find(parts, function (val) {
                        return parseInt(val, 10) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 999;
                    });

                    if (plz) {
                        value = value + "&filter=(plz:" + plz + ")";
                        if (hsnr) {
                            value = value + " AND (typ:Haus) AND haus:(" + hsnr + "*)";
                        }
                        else {
                            value = value + " AND (typ:Strasse OR typ:Ort OR typ:Geoname)";
                        }
                    }
                    else {
                        if (hsnr) {
                            value = value + "&filter=(typ:Haus) AND haus:(" + hsnr + "*)";
                        }
                        else {
                            value = value + "&filter=(typ:Strasse OR typ:Ort OR typ:Geoname)";
                        }
                    }
                }
            }
            $.ajax({
                url: this.get("bkgSuggestURL"),
                data: "count=15&query=" + value,
                context: this, // das Model
                async: true,
                type: "GET",
                success: function (data) {
                    try {
                        var treffer = [];

                        if (target === "start") {
                            _.each(data, function (strasse) {
                                treffer.push("id='" + strasse.suggestion + "' class='list-group-item startAdresseSelected'><span>" + strasse.highlighted + "</span>");
                            });
                            this.set("fromList", treffer);
                        }
                        else {
                            _.each(data, function (strasse) {
                                treffer.push("id='" + strasse.suggestion + "' class='list-group-item zielAdresseSelected'><span>" + strasse.highlighted + "</span>");
                            });
                            this.set("toList", treffer);
                        }
                    }
                    catch (error) {
                        // console.log(error);
                    }
                },
                error: function (error) {
                    Radio.trigger("Alert", "alert", {
                        text: "Adressabfrage fehlgeschlagen: " + error.statusText,
                        kategorie: "alert-warning"
                    });
                },
                timeout: 3000
            });
        },
        geosearchByBKG: function (value, target) {
            $.ajax({
                url: this.get("bkgGeosearchURL"),
                data: "srsName=" + Config.view.epsg + "&count=1&outputformat=json&query=" + value,
                context: this, // das model
                async: true,
                type: "GET",
                success: function (data) {
                    try {
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
                            if (data.features[0].properties.typ === "Strasse") {
                                this.suggestByBKG(data.features[0].properties.text + " &filter=(typ:Haus) ", target);
                            }
                            else if (data.features[0].properties.typ === "Ort") {
                                this.suggestByBKG(data.features[0].properties.text + " &filter=(typ:Strasse) ", target);
                            }
                            else if (data.features[0].properties.typ === "Geoname") {
                                this.suggestByBKG(data.features[0].properties.text + " &filter=(typ:Ort) ", target);
                            }
                        }
                    }
                    catch (error) {
                        // console.log(error);
                    }
                },
                error: function (error) {
                    Radio.trigger("Alert", "alert", {
                        text: "Adressabfrage fehlgeschlagen: " + error.statusText,
                        kategorie: "alert-warning"
                    });
                },
                timeout: 3000
            });
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
                url: this.get("viomRoutingURL"),
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
//                    this.get("map").addLayer(vectorlayer);
                    this.set("endDescription", olFeature.get("EndDescription"));
                    this.set("description", olFeature.get("RouteDescription"));
                    Radio.trigger("Map", "zoomToExtent", olFeature.getGeometry().getExtent());
                    this.addOverlay(olFeature);
                },
                error: function (data) {
                    $("#loader").hide();
                    this.set("description", "");
                    this.set("endDescription", "");
                    Radio.trigger("Alert", "alert", {
                        text: "Fehlermeldung beim Laden der Route: \n" + data.responseText,
                        kategorie: "alert-warning"
                    });
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
                position = olFeature.getGeometry().getLastCoordinate();

            html += "<span class='glyphicon glyphicon-flag'></span>";
            html += "<span>" + olFeature.get("EndDescription").substr(olFeature.get("EndDescription").indexOf(". ") + 1) + "</span>";
            html += "</div>";
            $("#map").append(html);
            this.set("mhpOverlay", new ol.Overlay({ element: $("#routingoverlay")[0]}));
            this.get("mhpOverlay").setPosition([position[0] + 7, position[1] - 7]);
            Radio.trigger("Map", "addOverlay", this.get("mhpOverlay"));
        }
    });

    return new RoutingModel();
});
