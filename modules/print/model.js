define([
    "backbone",
    "modules/core/util",
    "eventbus",
    "config",
    "modules/restReader/collection"
], function (Backbone, Util, EventBus, Config, RestReader) {
    "use strict";
    var model = Backbone.Model.extend({

        //
        defaults: {
            title: Config.print.title,
            outputFilename: Config.print.outputFilename,
            isActive: false, // für map.js --- damit  die Karte weiß ob der Druckdienst aktiviert ist
            gfiToPrint: [], // die sichtbaren GFIs
            center: Config.view.center
        },

        //
        url: function () {
            var resp;

            resp = RestReader.getServiceById(Config.print.printID);
            if (resp[0] && resp[0].get("url")) {
                this.set("printurl", resp[0].get("url"));
            }
            return Config.proxyURL + "?url=" + this.get("printurl") + "/master/info.json";
        },

        //
        initialize: function () {
            this.listenTo(this, {
                "change:layout change:scale change:isActive": this.updatePrintPage,
                "change:specification": this.getPDFURL,
                "change:isCurrentWin": this.setActive
            });

            this.listenTo(EventBus, {
                "mapView:sendCenter": this.setCenter,
                "mapView:sendOptions": this.setScaleByMapView
            });

            // get print config (info.json)
            this.fetch({
                cache: false,
                async: false,
                success: function (model) {
                    model.set("layout", _.findWhere(model.get("layouts"), {name: "A4 Hochformat"}));
                }
            });

            EventBus.on("winParams", this.setStatus, this);
            EventBus.on("receiveGFIForPrint", this.receiveGFIForPrint, this);
            EventBus.on("layerlist:sendVisibleWMSlayerList", this.setLayerToPrint, this);
            EventBus.on("sendDrawLayer", this.setDrawLayer, this);

            EventBus.trigger("mapView:getOptions");
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

        // Setzt den Maßstab für den Ausdruck über die Druckeinstellungen.
        setScale: function (index) {
            this.set("scale", this.get("scales")[index].value);
            EventBus.trigger("mapView:setScale", this.get("scale"));
        },

        // Setzt den Maßstab für den Ausdruck über das Zoomen in der Karte.
        setScaleByMapView: function (obj) {
            this.set("scale", parseInt(obj.scale, 10));
        },

        // Setzt die Zentrumskoordinate.
        setCenter: function (value) {
            this.set("center", value);
        },

        //
        setStatus: function (args) {
            if (args[2] === "print") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        setActive: function () {
            this.set("isActive", this.get("isCurrentWin"));
        },
        updatePrintPage: function () {
            EventBus.trigger("updatePrintPage", [this.get("isActive"), this.get("layout").map, this.get("scale")]);
        },

        /**
         *
         */
        getLayersForPrint: function () {
            this.set("layerToPrint", []);
            console.log(Config);
            if (_.has(Config.tree, "type") && Config.tree.type !== "light") {
                EventBus.trigger("getSelectedVisibleWMSLayer");
            }
            else {
                EventBus.trigger("layerlist:getVisibleWMSlayerList");
            }
            if (Config.tools.draw === true) {
                EventBus.trigger("getDrawlayer");
            }
            this.sendGFIForPrint();
        },
        /**
        *
        */
        setLayerToPrint: function (layers) {
            _.each(layers, function (layer) {
                // nur wichtig für treeFilter
                var params = {},
                    style = [];

                if (layer.has("SLDBody")) {
                    params.SLD_BODY = layer.get("SLDBody");
                }
                if (layer.get("id") === "2298") {
                    style.push("strassenbaumkataster_grau");
                }
                this.push("layerToPrint", {
                    type: layer.get("typ"),
                    layers: layer.get("layers").split(),
                    baseURL: layer.get("url"),
                    format: "image/png",
                    opacity: layer.get("opacity"),
                    customParams: params,
                    styles: style
                });
            }, this);
        },

        /**
         *
         */
        setDrawLayer: function (layer) {
            var features = [],
                featureStyles = {};

            _.each(layer.getSource().getFeatures(), function (feature, index) {
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

                featureStyles[index] = {
                    fillColor: this.getColor(feature.getStyle().getFill().getColor()).color,
                    fillOpacity: this.getColor(feature.getStyle().getFill().getColor()).opacity,
                    pointRadius: feature.getStyle().getImage().getRadius(),
                    strokeColor: this.getColor(feature.getStyle().getStroke().getColor()).color,
                    strokeWidth: feature.getStyle().getStroke().getWidth(),
                    strokeOpacity: this.getColor(feature.getStyle().getStroke().getColor()).opacity
                };
            }, this);
            this.push("layerToPrint", {
                type: "Vector",
                styles: featureStyles,
                geoJson: {
                    type: "FeatureCollection",
                    features: features
                }
            });
        },

        /**
         *
         */
        setSpecification: function () {
            var specification = {
                layout: $("#layoutField option:selected").html(),
                srs: Config.view.epsg,
                units: "m",
                outputFilename: this.get("outputFilename"),
                outputFormat: "pdf",
                layers: this.get("layerToPrint"),
                pages: [
                    {
                        center: this.get("center"),
                        scale: this.get("scale"),
                        dpi: 96,
                        mapTitle: this.get("title")
                    }
                ]
            };

            if (this.get("printGFIPosition") !== null) {
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
        setGFIPos: function () {
            var position = this.get("printGFIPosition");

            if (position !== null) {
                position[0] = position[0] + 0.25; // Verbesserung der Punktlage im Print
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
                                    coordinates: position
                                },
                                properties: {
                                    styleId: 0
                                }
                            },
                            {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: position
                                },
                                properties: {
                                    styleId: 1
                                }
                            }
                        ]
                    }
                });
            }
            this.setSpecification();
        },
        /**
        * Abfrage an popupmodel starten. Bedingt Config.tools.gfi: true.
        */
        sendGFIForPrint: function () {
            EventBus.trigger("sendGFIForPrint");
        },
        /**
        * [[Description]]
        * @param {Array} values - values[0] = GFIs(Object), values[1] = Sichbarkeit GFIPopup(boolean)
        */
        receiveGFIForPrint: function (values) {
            this.set("gfiParams", _.pairs(values[0]));
            this.set("gfiTitle", values[1]);
            this.set("printGFIPosition", values[2]);
            // Wenn eine GFIPos vorhanden ist, die Config das hergibt und die Anzahl der gfiParameter != 0 ist
            if (this.get("printGFIPosition") !== null && Config.print.gfi === true && this.get("gfiParams").length > 0) {
                this.set("createURL", this.get("printurl") + "/master_gfi_" + this.get("gfiParams").length.toString() + "/create.json");
            }
            else {
                if (_.has(Config.print, "configYAML") === true) {
                    this.set("createURL", this.get("printurl") + "/" + Config.print.configYAML + "/create.json");
                }
                else {
                    this.set("createURL", this.get("printurl") + "/master/create.json");
                }

            }
            this.setGFIPos();
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
                    EventBus.trigger("alert", {
                        text: "Druck fehlgeschlagen: " + error.statusText,
                        kategorie: "alert-warning"
                    });
                },
                complete: Util.hideLoader,
                beforeSend: Util.showLoader
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
        }
    });

    return model;
});
