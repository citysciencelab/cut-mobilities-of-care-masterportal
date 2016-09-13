define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Util = require("modules/core/util"),
        Animation;

    Animation = Backbone.Model.extend({
        defaults: {
            steps: 20,
            layer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                         stroke: new ol.style.Stroke({
                             color: [0, 0, 0, 0]
                         })
                     })
            }),
            params: {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                TYPENAME: "app:mrh_auspendler_gesamt",
                VERSION: "1.1.0",
                maxFeatures: "100"
            }
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            this.listenTo(this, {
                "change:lineFeatures": this.createLineString
            });

            this.getFeatures();
            Radio.trigger("Map", "addLayer", this.get("layer"));
        },

        setStatus: function (args) {
            if (args[2].getId() === "animation") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        getFeatures: function () {
            $.ajax({
                url: Util.getProxyURL("http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung"),
                data: this.get("params"),
                type: "GET",
                context: this,
                success: function (data) {
                    var wfsReader = new ol.format.WFS({
                        featureNS: "http://www.deegree.org/app",
                        featureType: "mrh_auspendler_gesamt"
                    });

                    this.setLineFeatures(wfsReader.readFeatures(data));
                },
                error: function (jqXHR, errorText, error) {
                    console.log(error);
                }
            });
        },

        createLineString: function () {
            _.each(this.getLineFeatures(), function (feature) {
                var startPoint = feature.getGeometry().getFirstCoordinate(),
                    endPoint = feature.getGeometry().getLastCoordinate(),
                    directionX = (endPoint[0] - startPoint[0]) / this.getSteps(),
                    directionY = (endPoint[1] - startPoint[1]) / this.getSteps(),
                    lineCoords = [];

                for (var i = 0; i <= this.getSteps(); i++) {
                    var newEndPt = new ol.geom.Point([startPoint[0] + i * directionX, startPoint[1] + i * directionY, 0]);
                    lineCoords.push(newEndPt.getCoordinates());
                }
                var line = new ol.Feature({
                    geometry: new ol.geom.LineString(lineCoords)
                });

                this.get("layer").getSource().addFeature(line);
            }, this);
        },

        setLineFeatures: function (value) {
            this.set("lineFeatures", value);
        },

        setSteps: function (value) {
            this.set("steps", value);
        },

        getLineFeatures: function () {
            return this.get("lineFeatures");
        },

        getSteps: function () {
            return this.get("steps");
        },

        play: function () {
            this.startAnimation();
        },

        moveFeature: function (event) {
            var styles = {
            "geoMarker": new ol.style.Style({
              image: new ol.style.Circle({
                radius: 7,
                snapToPixel: false,
                fill: new ol.style.Fill({color: "red"}),
                stroke: new ol.style.Stroke({
                  color: "white", width: 2
                })
              })
            })
          };
            var map = Radio.request("Map", "getMap");
            var vectorContext = event.vectorContext;
            var frameState = event.frameState;
var features = this.get("layer").getSource().getFeatures();

for (var i = 0; i < features.length; i++) {
    var feature = features[i];
            if (this.get("animating")) {
                var elapsedTime = frameState.time - this.get("now");
                // here the trick to increase speed is to jump some indexes
                // on lineString coordinates
                var index = Math.round(2 * elapsedTime / 1000);
                if (index >= this.get("steps")) {
                    this.stopAnimation(true);
                    return;
                }

                        var currentPoint = new ol.geom.Point(feature.getGeometry().getCoordinates()[index]);
this.set("currentPoint", currentPoint);
                        var feature = new ol.Feature(currentPoint);
                        vectorContext.drawFeature(feature, styles.geoMarker);
                }
            }
            // tell OL3 to continue the postcompose animation
            map.render();
        },

        startAnimation: function () {
            var map = Radio.request("Map", "getMap");

            if (this.get("animating")) {
                this.stopAnimation(false);
            }
            else {
                this.set("animating", true);
                console.log(this.get("animating"));
                this.set("now", new Date().getTime());
                map.on("postcompose", this.moveFeature, this);
                map.render();
            }
        },

        stopAnimation: function () {
            var map = Radio.request("Map", "getMap");

            this.set("animating", false);
            //   startButton.textContent = "Start Animation";
console.log(this.get("currentPoint"));
              // if animation cancelled set the marker at the beginning
            //  var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0];
            //   /** @type {ol.geom.Point} */ (geoMarker.getGeometry())
                // .setCoordinates(coord);
              // remove listener
             map.un("postcompose", this.moveFeature);
        }
    });

    return Animation;
});
