define([
    "backbone",
    "backbone.radio",
    "config",
    "openlayers"
], function (Backbone, Radio, Config, ol) {
    "use strict";
    var model = Backbone.Model.extend({

        //
        defaults: {
            title: Config.print.title,
            outputFilename: Config.print.outputFilename,
            outputFormat: "pdf",
            isActive: false, // für map.js --- damit  die Karte weiß ob der Druckdienst aktiviert ist
            gfiToPrint: [], // die sichtbaren GFIs
            center: Config.view.center,
            scale: {},
            layerToPrint: [],
            fetched: false, // gibt an, ob info.json schon geladen wurde
            printGFI: Config.print.gfi ? Config.print.gfi : false,
            printurl: ""
        },

        /*
         * Ermittelt die URL zum Fetchen in setStatus durch Abfrage der ServiceId
         */
        url: function () {
            var resp = Radio.request("RestReader", "getServiceById", Config.print.printID),
                url = resp[0] && resp[0].get("url") ? resp[0].get("url") : null;

            if (url) {
                var printurl = _.has(Config.print, "configYAML") === true ? url + "/" + Config.print.configYAML : url + "/master";

                this.set("printurl", printurl);
                return Config.proxyURL + "?url=" + printurl + "/info.json";
            }
            else {
                return "undefined"; // muss String übergeben, sonst Laufzeitfehler
            }
        },

        //
        initialize: function () {
            this.listenTo(this, {
                "change:layout change:scale change:isActive": this.updatePrintPage,
                "change:specification": this.getPDFURL,
                "change:isCurrentWin": this.setActive
            });

            this.listenTo(Radio.channel("MapView"), {
                "changedOptions": this.setScaleByMapView,
                "changedCenter": this.setCenter
            });

            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
        },

        // Überschreibt ggf. den Titel für den Ausdruck. Default Value kann in der config.js eingetragen werden.
        setTitle: function () {
            if ($("#titleField").val()) {
                this.set("title", $("#titleField").val());
            }
        },

        // Setzt das Format(DinA4/A3 Hoch-/Querformat) für den Ausdruck.
        setLayout: function (index) {
            this.set("layout", this.get("layouts")[index]);
        },

        getLayout: function () {
            return this.get("layout");
        },

        // Setzt den Maßstab für den Ausdruck über die Druckeinstellungen.
        setScale: function (index) {
            var scaleval = this.get("scales")[index].value;

            Radio.trigger("MapView", "setScale", scaleval);
        },

        // Setzt den Maßstab für den Ausdruck über das Zoomen in der Karte.
        setScaleByMapView: function () {
            var scale = _.find(this.get("scales"), function (scale) {
                return scale.value === Radio.request("MapView", "getOptions").scale;
            });

            this.set("scale", scale);
        },

        // Setzt die Zentrumskoordinate.
        setCenter: function (value) {
            this.set("center", value);
        },

        //
        setStatus: function (args) {
            if (args[2].getId() === "print") {
                if (this.get("fetched") === false) {
                    // get print config (info.json)
                    this.fetch({
                        cache: false,
                        success: function (model) {
                            _.each(model.get("scales"), function (scale) {
                                var scaletext = scale.value < 10000 ? scale.value : scale.value.substring(0, scale.value.length - 3) + " " + scale.value.substring(scale.value.length - 3);

                                scale.name = "1: " + scaletext;
                                scale.value = parseInt(scale.value);
                            });
                            model.set("layout", _.findWhere(model.get("layouts"), {name: "A4 Hochformat"}));
                            model.setScaleByMapView();
                            model.set("isCollapsed", false);
                            model.set("isCurrentWin", true);
                            model.set("fetched", true);
                        },
                        error: function () {
                            Radio.trigger("Alert", "alert", {text: "<strong>Druckkonfiguration konnte nicht geladen werden!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                            Radio.trigger("Window", "closeWin");
                        },
                        complete: function () {
                            Radio.trigger("Util", "hideLoader");
                        },
                        beforeSend: function () {
                            Radio.trigger("Util", "showLoader");
                        }
                    });
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
        setActive: function () {
            this.set("isActive", this.get("isCurrentWin"));
        },
        updatePrintPage: function () {
            if (this.has("scale")) {
                Radio.trigger("Map", "updatePrintPage", [this.get("isActive"), this.get("layout").map, this.get("scale").value]);
            }
        },

        /**
         *
         */
        getLayersForPrint: function () {
            this.set("layerToPrint", []);
            this.getGFIForPrint();
        },
        /**
        *
        */
        setLayerToPrint: function (layers) {
            layers = _.sortBy(layers, function (layer) {
                return layer.get("selectionIDX");
            });
            _.each(layers, function (layer) {
                // nur wichtig für treeFilter
                var params = {},
                    style = [],
                    layerURL = layer.get("url");

                if (layer.has("SLDBody")) {
                    params.SLD_BODY = layer.get("SLDBody");
                }
                if (layer.get("id") === "2298") {
                    style.push("strassenbaumkataster_grau");
                }
                if (layer.has("style")) {
                    style.push(layer.get("style"));
                }
                // Damit Web-Atlas gedruckt werden kann
                if (layer.get("id") === "51" || layer.get("id") === "53") {
                    layerURL = layer.get("url") + "__108a7035-f163-6294-f7dc-a81a2cfa13d6";
                }
                if (layer.get("id") === "55") {
                    layerURL = layer.get("url") + "__e5742a5e-f48c-9470-19c0-9d522cfa13d6";
                }
                this.push("layerToPrint", {
                    type: layer.get("typ"),
                    layers: layer.get("layers").split(),
                    baseURL: layerURL,
                    format: "image/png",
                    opacity: (100 - layer.get("transparency")) / 100,
                    customParams: params,
                    styles: style
                });
            }, this);
        },

        /**
         *
         */
        setLayer: function (layer) {
            if (!_.isUndefined(layer)) {
                var features = [],
                    circleFeatures = [], // Kreise können nicht gedruckt werden
                    featureStyles = {};

                // Alle features die eine Kreis-Geometrie haben
                _.each(layer.getSource().getFeatures(), function (feature) {
                    if (feature.getGeometry() instanceof ol.geom.Circle) {
                        circleFeatures.push(feature);
                    }
                });

                _.each(layer.getSource().getFeatures(), function (feature, index) {
                    // nur wenn es sich nicht um ein Feature mit Kreis-Geometrie handelt
                    if (_.contains(circleFeatures, feature) === false) {
                        features.push({
                            type: "Feature",
                            properties: {
                                _style: index
                            },
                            geometry: {
                                coordinates: feature.getGeometry().getCoordinates(),
                                type: feature.getGeometry().getType()
                            }
                        });

                        var type = feature.getGeometry().getType(),
                            styles = feature.getStyleFunction().call(feature),
                            style = styles[0];
                        // Punkte
                        if (type === "Point") {
                            // Punkte ohne Text
                            if (style.getText() === null) {
                                featureStyles[index] = {
                                fillColor: this.getColor(style.getImage().getFill().getColor()).color,
                                fillOpacity: this.getColor(style.getImage().getFill().getColor()).opacity,
                                pointRadius: style.getImage().getRadius(),
                                strokeColor: this.getColor(style.getImage().getFill().getColor()).color,
                                strokeOpacity: this.getColor(style.getImage().getFill().getColor()).opacity
                                };
                            }
                            // Texte
                            else {
                                featureStyles[index] = {
                                    label: style.getText().getText(),
                                    fontColor: this.getColor(style.getText().getFill().getColor()).color
                                };
                            }
                        }
                        // Polygone oder Linestrings
                        else {
                            featureStyles[index] = {
                                fillColor: this.getColor(style.getFill().getColor()).color,
                                fillOpacity: this.getColor(style.getFill().getColor()).opacity,
                                strokeColor: this.getColor(style.getStroke().getColor()).color,
                                strokeWidth: style.getStroke().getWidth()
                            };
                        }
                    }
                }, this);
                this.push("layerToPrint", {
                    type: "Vector",
                    styles: featureStyles,
                    geoJson: {
                        type: "FeatureCollection",
                        features: features
                    }
                });
            }
        },

        /**
         *
         */
        setSpecification: function (gfiPosition) {
            var layers = Radio.request("Map", "getLayers").getArray(),
                animationLayer = _.filter(layers, function (lay) {
                    return lay.get("name") === "animationLayer";
                });

            this.setLayerToPrint(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WMS"}));
            this.setLayer(Radio.request("Draw", "getLayer"));
            if (animationLayer.length > 0) {
                this.setLayer(animationLayer[0]);
            }

            var specification = {
                // layout: $("#layoutField option:selected").html(),
                layout: this.getLayout().name,
                srs: Config.view.epsg,
                units: "m",
                outputFilename: this.get("outputFilename"),
                outputFormat: this.getoutputFormat(),
                layers: this.get("layerToPrint"),
                pages: [
                    {
                        center: Radio.request("MapView", "getCenter"),
                        scale: this.get("scale").value,
                        scaleText: this.get("scale").name,
                        geodetic: true,
                        dpi: 96,
                        mapTitle: this.get("title")
                    }
                ]
            };

            if (gfiPosition !== null) {
                _.each(_.flatten(this.get("gfiParams")), function (element, index) {
                    specification.pages[0]["attr_" + index] = element;
                }, this);
                specification.pages[0].layerName = this.get("gfiTitle");
            }
            this.set("specification", specification);
        },
        /**
         * Checkt, ob Kreis an GFI-Position gezeichnet werden soll und fügt ggf. Layer ein.
         */
        setGFIPos: function (gfiPosition) {
            if (gfiPosition !== null) {
                gfiPosition[0] = gfiPosition[0] + 0.25; // Verbesserung der Punktlage im Print
                this.push("layerToPrint", {
                    type: "Vector",
                    styleProperty: "styleId",
                    styles: {
                        0: {
                            fill: false,
                            pointRadius: 8,
                            stroke: true,
                            strokeColor: "#ff0000",
                            strokeWidth: 3
                        },
                        1: {
                            fill: true,
                            pointRadius: 1,
                            fillColor: "#000000",
                            stroke: false
                        }
                    },
                    geoJson: {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: gfiPosition
                                },
                                properties: {
                                    styleId: 0
                                }
                            },
                            {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: gfiPosition
                                },
                                properties: {
                                    styleId: 1
                                }
                            }
                        ]
                    }
                });
            }
            this.setSpecification(gfiPosition);
        },

        /**
        * Setzt die createURL in Abhängigkeit der GFI
        */
        getGFIForPrint: function () {
            var gfis = Radio.request("GFIPopup", "getGFIForPrint"),
                gfiParams = _.isArray(gfis) === true ? _.pairs(gfis[0]) : null, // Parameter
                gfiTitle = _.isArray(gfis) === true ? gfis[1] : "", // Layertitel
                gfiPosition = _.isArray(gfis) === true ? gfis[2] : null, // Koordinaten des GFI
                printGFI = this.get("printGFI"), // soll laut config Parameter gedruckt werden?
                printurl = this.get("printurl"); // URL des Druckdienstes

            this.set("gfiParams", gfiParams);
            this.set("gfiTitle", gfiTitle);
            // Wenn eine GFIPos vorhanden ist, die Config das hergibt und die Anzahl der gfiParameter != 0 ist
            if (!_.isNull(gfiPosition) && printGFI === true && gfiParams && gfiParams.length > 0) {
                this.set("createURL", printurl + "_gfi_" + this.get("gfiParams").length.toString() + "/create.json");
            }
            else {
                this.set("createURL", printurl + "/create.json");
            }
            this.setGFIPos(gfiPosition);
        },

        /**
         * @desc Führt einen HTTP-Post-Request aus.
         */
        getPDFURL: function () {
            $.ajax({
                url: Config.proxyURL + "?url=" + this.get("createURL"),
                type: "POST",
                context: this,
                data: JSON.stringify(this.get("specification")),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                success: this.openPDF,
                error: function (error) {
                    Radio.trigger("Alert", "alert", {
                        text: "Druck fehlgeschlagen: " + error.statusText,
                        kategorie: "alert-warning"
                    });
                },
                complete: function () {
                    Radio.trigger("Util", "hideLoader");
                },
                beforeSend: function () {
                    Radio.trigger("Util", "showLoader");
                }
            });
        },

        /**
         * @desc Öffnet das erzeugte PDF im Browser.
         * @param {Object} data - Antwort vom Druckdienst. Enthält die URL zur erzeugten PDF.
         */
        openPDF: function (data) {
            window.open(data.getURL);
        },

        /**
         * @desc Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * @param {String} attribute - Das Attribut das gesetzt werden soll.
         * @param {whatever} value - Der Wert des Attributs.
         */
        push: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        },

        // Prüft ob es sich um einen rgb(a) oder hexadezimal String handelt.
        // Ist es ein rgb(a) String, wird er in ein hexadezimal String umgewandelt.
        // Wenn vorhanden, wird die Opacity(default = 1) überschrieben.
        // Gibt den hexadezimal String und die Opacity zurück.
        getColor: function (value) {
            var color = value,
                opacity = 1;
            // color kommt als array--> parsen als String
            color = color.toString();

            if (color.search("#") === -1) {
                var begin = color.indexOf("(") + 1;

                color = color.substring(begin, color.length - 1);
                color = color.split(",");
                if (color.length === 4) {
                    opacity = parseFloat(color[3], 10);
                }
                color = this.rgbToHex(parseInt(color[0], 10), parseInt(color[1], 10), parseInt(color[2], 10));
                return {
                    "color": color,
                    "opacity": opacity
                };
            }
            else {
                return {
                    "color": color,
                    "opacity": opacity
                };
            }
        },

        // Setzt den hexadezimal String zusammen und gibt ihn zurück.
        rgbToHex: function (red, green, blue) {
            return "#" + this.componentToHex(red) + this.componentToHex(green) + this.componentToHex(blue);
        },

        // Ein Integer (color) wird in ein hexadezimal String umgewandelt und zurückgegeben.
        componentToHex: function (color) {
            var hex = color.toString(16);

            return hex.length === 1 ? "0" + hex : hex;
        },
        getoutputFormat: function () {
            if (Config.print.outputFormat) {
                return Config.print.outputFormat;
            }
            else {
                return "pdf";
            }
        }
    });

    return model;
});
