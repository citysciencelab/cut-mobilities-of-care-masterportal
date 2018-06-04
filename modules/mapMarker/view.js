define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        MapHandlerModel = require("modules/mapMarker/model"),
        MapMarker;

    MapMarker = Backbone.View.extend({
        model: new MapHandlerModel(),
        id: "searchMarker",
        className: "glyphicon glyphicon-map-marker",
        /**
        * @description View des Map Handlers
        * @returns {void}
        */
        initialize: function () {
            var markerPosition,
                channel = Radio.channel("MapMarker");

            channel.on({
                "clearMarker": this.clearMarker,
                "zoomTo": this.zoomTo,
                "hideMarker": this.hideMarker,
                "showMarker": this.showMarker,
                "zoomToBKGSearchResult": this.zoomToBKGSearchResult
            }, this);

            this.render();
            // For BauInfo: requests customModule and askes for marker position to set.
            markerPosition = Radio.request("CustomModule", "getMarkerPosition");
            if (markerPosition) {
                this.showMarker(markerPosition);
            }
            this.model.askForMarkers();
        },
        render: function () {
            this.model.get("marker").setElement(this.$el[0]);
        },

        /**
        * @description Entfernt den searchVector
        * @returns {void}
        */
        clearMarker: function () {
            this.model.hideFeature();
            this.hideMarker();
        },

        /**
        * @description Zoom auf Treffer
        * @param {Object} hit - Treffer der Searchbar
        * @returns {void}
        */
        zoomTo: function (hit) {
            // Lese index mit Maßstab 1:1000 als maximal Scale, sonst höchstmögliche Zommstufe
            var resolutions = Radio.request("MapView", "getResolutions"),
                index = _.indexOf(resolutions, 0.2645831904584105) === -1 ? resolutions.length : _.indexOf(resolutions, 0.2645831904584105),
                hasPolygon, isMobile,
                coord = _.isArray(hit.coordinate) ? hit.coordinate : hit.coordinate.split(" ");

            this.clearMarker();
            switch (hit.type) {
                case "Straße": {
                    this.model.setWkt("POLYGON", coord);

                    Radio.trigger("Map", "zoomToExtent", this.model.getExtentFromString(), {maxZoom: index});
                    break;
                }
                case "Parcel": {
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    this.showMarker(coord);
                    break;
                }
                case "Krankenhaus": {
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    break;
                }
                case "Adresse": {
                    this.showMarker(coord);
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    break;
                }
                case "Stadtteil": {
                    hasPolygon = _.has(hit, "polygon");

                    if (hasPolygon) {
                        this.model.setWkt("POLYGON", hit.polygon);
                        Radio.trigger("Map", "zoomToExtent", this.model.getExtentFromString(), {maxZoom: index});
                    }
                    else {
                        this.showMarker(coord);
                        Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    }
                    break;
                }
                case "Thema": {
                    isMobile = Radio.request("Util", "isViewMobile");

                    // desktop - Themenbaum wird aufgeklappt
                    if (isMobile === false) {
                        Radio.trigger("ModelList", "showModelInTree", hit.id);
                    }
                    // mobil
                    else {
                        // Fügt das Model zur Liste hinzu, falls noch nicht vorhanden
                        Radio.trigger("ModelList", "addModelsByAttributes", {id: hit.id});
                        Radio.trigger("ModelList", "setModelAttributesById", hit.id, {isSelected: true});
                    }
                    break;
                }
                case "Olympiastandort": {
                    this.showMarker(coord);
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    break;
                }
                case "Paralympiastandort": {
                    this.showMarker(coord);
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    break;
                }
                case "SearchByCoord": {
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    this.showMarker(coord);
                    break;
                }
                case "Feature-Lister-Hover": {
                    this.showMarker(coord);
                    break;
                }
                case "Feature-Lister-Click": {
                    Radio.trigger("Map", "zoomToExtent", coord);
                    break;
                }
                case "Schulinfosystem": {
                    this.showMarker(coord);
                    Radio.trigger("MapView", "setCenter", coord, 6);
                    break;
                }
                case "POI": {
                    Radio.trigger("Map", "zoomToExtent", coord, {maxZoom: index});
                    break;
                }
                default: {
                    if (coord.length === 2) {
                        Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                        this.showMarker(coord);
                    }
                    else if (coord.length === 4) {
                        Radio.trigger("Map", "zoomToExtent", coord);
                    }
                    else if (coord.length > 4) {
                        this.model.setWkt("POLYGON", coord);
                        this.model.showFeature();
                        Radio.trigger("Map", "zoomToExtent", this.model.getExtentFromString());
                    }

                    break;
                }
            }
        },

        /*
        * @description Getriggert von bkg empfängt diese Methode die XML der gesuchten Adresse
        * @param {string} data - Die Data-Object des request.
        */
        zoomToBKGSearchResult: function (data) {
            var coordinates;

            if (data.features[0].properties.bbox.type === "Point") {
                Radio.trigger("MapView", "setCenter", data.features[0].properties.bbox.coordinates, this.model.get("zoomLevel"));
                this.showMarker(data.features[0].properties.bbox.coordinates);
            }
            else if (data.features[0].properties.bbox.type === "Polygon") {
                coordinates = "";

                _.each(data.features[0].properties.bbox.coordinates[0], function (point) {
                    coordinates += point[0] + " " + point[1] + " ";
                });
                this.model.setWkt("POLYGON", coordinates.trim());
                Radio.trigger("Map", "zoomToExtent", this.model.getExtentFromString());
            }
        },

        showMarker: function (coordinate) {
            this.clearMarker();
            this.model.get("marker").setPosition(coordinate);
            this.$el.show();
        },

        hideMarker: function () {
            this.$el.hide();
        }
    });

    return MapMarker;
});
