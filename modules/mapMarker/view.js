define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "modules/mapMarker/model",
    "eventbus"
    ], function (Backbone, Radio, ol, MapHandlerModel, EventBus) {
    "use strict";

    var searchVector = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "#08775f",
                lineDash: [8],
                width: 4
            }),
            fill: new ol.style.Fill({
                color: "rgba(8, 119, 95, 0.3)"
            })
        })
    });

    EventBus.trigger("addLayer", searchVector);

    return Backbone.View.extend({
        model: MapHandlerModel,
        id: "searchMarker",
        className: "glyphicon glyphicon-map-marker",
        template: _.template("<span class='glyphicon glyphicon-remove'></span>"),
        events: {
            "click .glyphicon": "hideMarker"
        },
        /**
        * @description View des Map Handlers
        */
        initialize: function () {
            var channel = Radio.channel("MapMarker");

            channel.reply({
                "getCloseButtonCorners": function () {
                    if (this.$el.is(":visible") === false) {
                        return {
                            top: -1,
                            bottom: -1,
                            left: -1,
                            right: -1
                        };
                    }
                    else {
                        var bottomSM = $("#searchMarker .glyphicon-remove").offset().top,
                            leftSM = $("#searchMarker .glyphicon-remove").offset().left,
                            widthSM = $("#searchMarker .glyphicon-remove").outerWidth(),
                            heightSM = $("#searchMarker .glyphicon-remove").outerHeight(),
                            topSM = bottomSM + heightSM,
                            rightSM = leftSM + widthSM;

                        return {
                            top: topSM,
                            bottom: bottomSM,
                            left: leftSM,
                            right: rightSM
                        };
                    }
                }
            }, this);

            this.listenTo(EventBus, {
                "mapHandler:clearMarker": this.clearMarker,
                "mapHandler:zoomTo": this.zoomTo,
                "mapHandler:hideMarker": this.hideMarker,
                "mapHandler:showMarker": this.showMarker,
                "mapHandler:zoomToBPlan": this.zoomToBPlan,
                "mapHandler:zoomToBKGSearchResult": this.zoomToBKGSearchResult
            }, this);

            this.render();
            this.model.askForMarkers();
        },
        render: function () {
            this.$el.html(this.template());

            this.model.get("marker").setElement(this.$el[0]);
        },
        /**
        * @description Entfernt den searchVector
        */
        clearMarker: function () {
            searchVector.getSource().clear();
        },
        /**
        * @description Zoom auf Treffer
        * @param {Object} hit - Treffer der Searchbar
        */
        zoomTo: function (hit) {
            var zoomLevel;

            this.clearMarker();
            switch (hit.type) {
                case "Ort": {
                    EventBus.trigger("bkg:bkgSearch", hit.name); // Abfrage der Details zur Adresse inkl. Koordinaten
                    break;
                }
                case "Straße": {
                    this.model.getWKTFromString("POLYGON", hit.coordinate);
                    EventBus.trigger("zoomToExtent", this.model.getExtentFromString());
                    break;
                }
                case "Parcel": {
                    EventBus.trigger("mapView:setCenter", hit.coordinate, 7);
                    this.showMarker(hit.coordinate);
                    break;
                }
                case "Krankenhaus": {
                    EventBus.trigger("mapView:setCenter", hit.coordinate, 5);
                    break;
                }
                case "Adresse": {
                    zoomLevel = 7;
                    this.showMarker(hit.coordinate);
                    EventBus.trigger("mapView:setCenter", hit.coordinate, zoomLevel);
                    break;
                }
                case "Stadtteil": {
                    zoomLevel = 4;
                    this.showMarker(hit.coordinate);
                    EventBus.trigger("mapView:setCenter", hit.coordinate, zoomLevel);
                    break;
                }
                case "Thema": {
                    Radio.trigger("ModelList", "showModelInTree", hit.id);
                    //EventBus.trigger("showLayerInTree", hit.id); // den Tree gibt es nur zusammen mit Karte
                    break;
                }
                case "Olympiastandort": {
                    zoomLevel = 5;
                    this.showMarker(hit.coordinate);
                    EventBus.trigger("mapView:setCenter", hit.coordinate, zoomLevel);
                    break;
                }
                case "Paralympiastandort": {
                    zoomLevel = 5;
                    this.showMarker(hit.coordinate);
                    EventBus.trigger("mapView:setCenter", hit.coordinate, zoomLevel);
                    break;
                }
                case "festgestellt": {
                    EventBus.trigger("specialWFS:requestbplan", hit.type, hit.name); // Abfrage der Details des BPlans, inkl. Koordinaten
                    break;
                }
                case "im Verfahren": {
                    EventBus.trigger("specialWFS:requestbplan", hit.type, hit.name); // Abfrage der Details des BPlans, inkl. Koordinaten
                    break;
                }
                case "SearchByCoord": {
                    EventBus.trigger("mapView:setCenter", hit.coordinate, 7);
                    this.showMarker(hit.coordinate);
                    break;
                }
                case "Feature-Lister-Hover": {
                    this.showMarker(hit.coordinate);
                    break;
                }
                case "Feature-Lister-Click": {
                    EventBus.trigger("zoomToExtent", hit.coordinate);
                    break;
                }
                case "Kita": {
                    zoomLevel = 8;
                    this.showMarker(hit.coordinate);
                    EventBus.trigger("mapView:setCenter", hit.coordinate, zoomLevel);
                    break;
                }
            }
        },
        /*
        * @description Getriggert vom specialWFS empfängt diese Methode die XML des zu suchenden BPlans.
        * @param {string} data - Die Data-XML des request.
        */
        zoomToBPlan: function (data) {
            var GMLReader = new ol.format.GML(),
                feature = GMLReader.readFeatures(data)[0],
                extent;

            this.clearMarker();
            extent = feature.getGeometry().getExtent();
            searchVector.getSource().addFeature(feature);
            searchVector.setVisible(true);
            EventBus.trigger("zoomToExtent", extent);
        },
        /*
        * @description Getriggert von bkg empfängt diese Methode die XML der gesuchten Adresse
        * @param {string} data - Die Data-Object des request.
        */
        zoomToBKGSearchResult: function (data) {
            if (data.features[0].properties.bbox.type === "Point") {
                EventBus.trigger("mapView:setCenter", data.features[0].properties.bbox.coordinates, 5);
                this.showMarker(data.features[0].properties.bbox.coordinates);
            }
            else if (data.features[0].properties.bbox.type === "Polygon") {
                var coordinates = "";

                _.each(data.features[0].properties.bbox.coordinates[0], function (point) {
                    coordinates += point[0] + " " + point[1] + " ";
                });
                this.model.getWKTFromString("POLYGON", coordinates.trim());
                EventBus.trigger("zoomToExtent", this.model.getExtentFromString());
            }
        },
        /**
        *
        */
        showMarker: function (coordinate) {
            this.model.get("marker").setPosition(coordinate);
            this.$el.css("display", "block");
        },
        /**
        *
        */
        hideMarker: function () {
            this.$el.css("display", "none");
        }
    });
});
