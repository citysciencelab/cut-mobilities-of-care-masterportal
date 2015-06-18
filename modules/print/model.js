define([
    "backbone",
    "modules/core/util",
    "eventbus",
    "config"
], function (Backbone, Util, EventBus, Config) {

    var model = Backbone.Model.extend({

        /**
         *
         */
        defaults: {
            outputFilename: Config.print.outputFilename,
            printTitle: Config.print.title,
            isActive: false, // für map.js --- damit  die Karte weiß ob der Druckdienst aktiviert ist
            gfiToPrint: [], // die sichtbaren GFIs
            currentMapScale: Config.view.scale, // akuteller Maßstab
            currentMapCenter: Config.view.center // aktuelle Zentrumkoordinate
        },

        /**
         *
         */
        url: Config.proxyURL + "?url=" + Config.print.url() + "master/info.json",

        /**
         *
         */
        initialize: function () {
            this.on("change:specification", this.getPDFURL, this);

            // get print config (info.json)
            this.fetch({
                cache: false,
                async: false
            });

            this.set("currentLayout", this.get("layouts")[0]);
            this.set("currentScale", this.get("currentMapScale"));
            this.on("change:isCurrentWin", this.setActive, this);
            this.on("change:currentLayout change:currentScale change:isActive", this.updatePrintPage, this);

            EventBus.on("winParams", this.setStatus, this),
            EventBus.on("sendVisibleWMSLayer", this.setLayerToPrint, this);
            EventBus.on("gfiForPrint", this.setGFIToPrint, this);
            EventBus.on("sendDrawLayer", this.setDrawLayer, this);
            EventBus.on("currentMapCenter", this.setCurrentMapCenter, this);
            EventBus.on("currentMapScale", this.setCurrentMapScale, this);
        },

        /**
         *
         */
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
            EventBus.trigger("updatePrintPage", [this.get("isActive"), this.get("currentLayout").map, this.get("currentScale")]);
        },
        setCurrentMapCenter: function (value) {
            this.set("currentMapCenter", value);
        },
        setCurrentMapScale: function (value) {
            this.set("currentMapScale", value);
            this.set("currentScale", this.get("currentMapScale"));
        },
        setCurrentLayout: function (index) {
            this.set("currentLayout", this.get("layouts")[index]);
        },
        setCurrentScale: function (index) {
            this.set("currentScale", this.get("scales")[index].value);
        },

        /**
         *
         */
        getLayersForPrint: function () {
            this.set("layerToPrint", []);
            if (_.has(Config, "tree") === true) {
                EventBus.trigger("getSelectedVisibleWMSLayer");
            }
            else {
                EventBus.trigger("getVisibleWMSLayer");
            }
            if (Config.tools.draw === true) {
                EventBus.trigger("getDrawlayer");
            }
            this.setSpecification();
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
                    fillColor: feature.getStyle().getFill().getColor(),
                    pointRadius: feature.getStyle().getImage().getRadius(),
                    strokeColor: feature.getStyle().getStroke().getColor(),
                    strokeWidth: feature.getStyle().getStroke().getWidth()
                };
            });
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
                srs: "EPSG:25832",
                units: "m",
                outputFilename: this.get("outputFilename"),
                outputFormat: "pdf",
                layers: this.get("layerToPrint"),
                pages: [
                    {
                        center: this.get("currentMapCenter"),
                        scale: this.get("currentScale"),
                        dpi: 96,
                        mapTitle: this.get("printTitle")
                    }
                ]
            };

            if (this.get("hasPrintGFIParams") === true) {
                _.each(_.flatten(this.get("gfiParams")), function (element, index) {
                    specification.pages[0]["attr_" + index] = element;
                }, this);
                specification.pages[0].layerName = $(".gfi-title").text();
            }

            this.set("specification", specification);
        },

        /**
        * [[Description]]
        * @param {Array} values - values[0] = GFIs(Object), values[1] = Sichbarkeit GFIPopup(boolean)
        */
        setGFIToPrint: function (values) {
            this.set("gfiParams", _.pairs(values[0]));
            this.set("hasPrintGFIParams", values[1]);
            if (this.get("hasPrintGFIParams") === true && Config.print.gfi === true) {
                switch (this.get("gfiParams").length) {
                    case 4: {
                        this.set("createURL", Config.print.url() + "/master_gfi_4/create.json");
                        break;
                    }
                    case 5: {
                        this.set("createURL", Config.print.url() + "/master_gfi_5/create.json");
                        break;
                    }
                    case 6: {
                        this.set("createURL", Config.print.url() + "/master_gfi_6/create.json");
                        break;
                    }
                }
            }
            else {
                this.set("createURL", Config.print.url() + "/master/create.json");
            }
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
        }
    });

        return model;
});
