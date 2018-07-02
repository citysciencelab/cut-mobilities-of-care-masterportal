define(function (require) {

    var ol = require("openlayers"),
        Radio = require("backbone.radio"),
        ZoomToGeometry;

    ZoomToGeometry = Backbone.Model.extend({
        defaults: {
            wfsParams: {
                url: "https://geodienste.hamburg.de/HH_WFS_Verwaltungsgrenzen",
                version: "1.1.0",
                typename: "app:bezirke",
                attribute: "bezirk_name"
            },
            isRender: false
        },
        initialize: function () {
            var name = Radio.request("ParametricURL", "getZoomToGeometry"),
                channel = Radio.channel("ZoomToGeometry");

            channel.on({
                "zoomToGeometry": this.zoomToGeometry,
                "setIsRender": this.setIsRender
            }, this);

            if (name.length > 0 && name !== "ALL") {
                this.zoomToGeometry(name, this.getWfsParams());
            }

            Radio.trigger("Map", "registerListener", "postcompose", this.handlePostCompose, this);
        },
        /**
        * Zoomt auf eine Geometrie, die auf einem WFS geladen wird.
        * param name string naem des Features auf das gezommt werdem soll
        * wfsParams string optional die Parameter, des WFS, von dem die Featurs geladen werden sollen, wenn nicht angegeben, dann werden standardwerte des Moduls genommen.
        **/
        zoomToGeometry: function (name, wfsParams) {
            var wfsParams = wfsParams || this.getWfsParams();

            if (!this.validateWfsParams(wfsParams)) {
                return;
            }

            this.getGeometryFromWFS(name, wfsParams);
        },
        validateWfsParams: function (wfsParams) {
            var keysArray = _.keys(this.getWfsParams());

            _.each(keysArray, function (key) {
                if (!_.contains(wfsParams, key) || _.isUndefined(wfsParams[key])) {
                    return false;
                }
            });
            return true;
        },
        getGeometryFromWFS: function (name, wfsParams) {
            var data = "service=WFS&version=" + wfsParams.version + "&request=GetFeature&TypeName=" + wfsParams.typename;

            $.ajax({
                url: Radio.request("Util", "getProxyURL", wfsParams.url),
                data: encodeURI(data),
                context: this,
                async: false,
                type: "GET",
                success: function (data) {
                    this.zoomToFeature(data, name, wfsParams.attribute);
                },
                timeout: 6000,
                error: function () {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Der parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong> <br> <small>Details: Ein benötigter Dienst antwortet nicht.</small>",
                        kategorie: "alert-warning"
                    });
                }
            });
        },
        /**
        * zommt auf das Feature, das vom WFS geladen wurde.
        *
        **/
        zoomToFeature: function (data, name, attribute) {
            var foundFeature = this.parseFeatures(data, name, attribute),
                extent;

            if (_.isUndefined(foundFeature)) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Leider konnten die Objekte zu denen gezommt werden soll nicht geladen werden</strong> <br> <small>Details: Kein Objekt gefunden, dessen Attribut \"" + attribute + "\" den Wert \"" + name + "\" einnimmt.</small>",
                    kategorie: "alert-warning"
                });
            }
            else {
                extent = this.calcExtent(foundFeature);
                Radio.trigger("Map", "zoomToExtent", extent);
            }
            this.setFeatureGeometry(foundFeature.getGeometry());
        },
        /**
        * durchsucht ein GML String nach einem bestimmten Feature
        * param data der GML String
        * name Name des Features
        * attribut GML-Attribut das nach dem Namen durchsucht werden soll
        **/
        parseFeatures: function (data, name, attribute) {
            var format = new ol.format.WFS(),
                features = format.readFeatures(data),
                foundFeature = _.filter(features, function (feature) {
                    if (!_.contains(feature.getKeys(), attribute)) {
                        return false;
                    }
                    return feature.get(attribute).toUpperCase().trim() === name.toUpperCase().trim();
                });

            return foundFeature[0];
        },
        calcExtent: function (feature) {
            var coordLength = 0,
                polygonIndex = 0;

            // feature.getGeometry() = Multipolygon
            // für den Extent wird das größte Polygon genommen
            _.each(feature.getGeometry().getPolygons(), function (polygon, index) {
                if (polygon.getCoordinates()[0].length > coordLength) {
                    coordLength = polygon.getCoordinates()[0].length;
                    polygonIndex = index;
                }
            });

            return feature.getGeometry().getPolygon(polygonIndex).getExtent();
        },

        handlePostCompose: function (evt) {
            var canvas = evt.context;

            if (this.getIsRender() === true && _.isUndefined(this.getFeatureGeometry()) === false) {
                canvas.beginPath();
                this.drawOutsidePolygon(canvas);
                this.drawInsidePolygon(canvas);
                canvas.fillStyle = "rgba(0, 0, 0, 0.4)";
                canvas.fill();
                canvas.restore();
            }
        },

        drawOutsidePolygon: function (canvas) {
            var size = Radio.request("Map", "getSize"),
                height = size[1] * ol.has.DEVICE_PIXEL_RATIO,
                width = size[0] * ol.has.DEVICE_PIXEL_RATIO;

            canvas.moveTo(0, 0);
            canvas.lineTo(width, 0);
            canvas.lineTo(width, height);
            canvas.lineTo(0, height);
            canvas.lineTo(0, 0);
            canvas.closePath();
        },

        drawInsidePolygon: function (canvas) {

            _.each(this.getFeatureGeometry().getPolygons(), function (polygon) {
                // Damit es als inneres Polygon erkannt wird, muss es gegen die Uhrzeigerrichtung gezeichnet werden
                var coordinates = polygon.getCoordinates()[0].reverse();

                _.each(coordinates, function (coordinate) {
                    var coord = Radio.request("Map", "getPixelFromCoordinate", coordinate);

                    canvas.lineTo(coord[0] * ol.has.DEVICE_PIXEL_RATIO, coord[1] * ol.has.DEVICE_PIXEL_RATIO);
                });
                canvas.closePath();
            });
        },

        // getter for wfsParams
        getWfsParams: function () {
            return this.get("wfsParams");
        },
        // setter for wfsParams
        setWfsParams: function (value) {
            this.set("wfsParams", value);
        },
        // setter for bezirk Geometry
        setFeatureGeometry: function (value) {
            this.set("featureGeometry", value);
        },
        // getter for bezirk Geometry
        getFeatureGeometry: function () {
            return this.get("featureGeometry");
        },
        setIsRender: function (value) {
            this.set("isRender", value);
        },
        getIsRender: function () {
            return this.get("isRender");
        }
    });
    return ZoomToGeometry;
});
