define([
    "backbone",
    "openlayers",
    "eventbus",
    "backbone.radio",
    "proj4"
], function () {
    var Backbone = require("backbone"),
        ol = require("openlayers"),
        EventBus = require("eventbus"),
        Radio = require("backbone.radio"),
        proj4 = require("proj4"),
        ImportTool;

    ImportTool = Backbone.Model.extend({
        defaults: {
            text: "Dateipfad",
            features: [],
            source: new ol.source.Vector(),
            layer: new ol.layer.Vector(),
            format: new ol.format.KML({extractStyles: false}),
            url: "test.kml"
        },

        initialize: function () {
            this.listenTo(EventBus, {
                "winParams": this.setStatus,
                "getDrawlayer": this.getLayer
            });

            this.listenTo(this, {
                "change:text": this.setStyle,
                
            });
        },

        setStatus: function (args) {
            if (args[2] === "kmlimport" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        
        setText: function (value) {
            this.set("text", value);
        },
        getText: function () {
            return this.get("text");
        },
        
        setFeatures: function (value) {
          this.set("features", value);  
        },
        getFeatures: function () {
            return this.get("features");
        },
        setSource: function (value) {
          this.set("source", value);  
        },
        getSource: function () {
            return this.get("source");
        },
        setLayer: function (value) {
          this.set("layer", value);  
        },
        getLayer: function () {
            return this.get("layer");
        },
        setFormat: function (value) {
          this.set("format", value);  
        },
        getFormat: function () {
            return this.get("format");
        },
        setUrl: function (value) {
          this.set("url", value);  
        },
        getUrl: function () {
            return this.get("url");
        },
        
        importKML: function () {
            console.log("IMPORT KML");

            this.sendRequest(this.getUrl(), this.getFormat());

            
        },
        sendRequest: function (url,format) {
            $.ajax({
                url: url,
                context: this,
                type: 'GET',
                contentType: 'application/vnd.google-earth.kml+xml', 
                success : this.getFeaturesFromKML,
                error: function () {
                    alert("URL: "+ Util.getProxyURL(url) + " nicht erreichbar.");
                }
            }); 
        },
        getFeaturesFromKML: function (data) { 
            var format= this.getFormat(),
                features = format.readFeatures(data
//                    ,{
//                    dataProjection: 'EPSG:4326',
//                    featureProjection: 'EPSG:25832'
//                    }
            );  
            this.setFormat(format);
            this.setFeatures(features);
            this.transformFeatures();
        },
        transformFeatures: function () {
            var features = this.getFeatures();

            _.each(features, function(feature){
                var transCoord = this.transformCoords(feature.getGeometry(), this.getProjections("EPSG:4326", "EPSG:25832", "32"));
                
                feature.getGeometry().setCoordinates(transCoord, "XY");
            },this);
            this.setFeatures(features);
            this.featuresToMap();
        },
        
        featuresToMap: function () {
            var features = this.getFeatures(),
                source = this.getSource(),
                layer = this.getLayer(),
                format = this.getFormat();
            
            source.addFeatures(features);
            layer.setSource(source);
            EventBus.trigger("addLayer", layer);
            
            
        },
        
        getProjections: function (sourceProj, destProj, zone) {
//            proj4.defs(sourceProj, "+proj=utm +zone=" + zone + "ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");
            
            return {
                sourceProj: proj4(sourceProj),
                destProj: proj4(destProj)
            };
        },
        transformCoords: function (geometry, projections) {
            var transCoord = [];

            switch (geometry.getType()) {
                case "Polygon": {
                    transCoord = this.transformPolygon(geometry.getCoordinates(), projections, this);
                    break;
                }
                case "Point": {
                    transCoord = this.transformPoint(geometry.getCoordinates(), projections);
                    break;
                }
                case "LineString": {
                    transCoord = this.transformLine(geometry.getCoordinates(), projections, this);
                    break;
                }
                default: {
                    EventBus.trigger("alert", "Unbekannte Geometry: <br><strong>" + geometry.getType());
                }
            }
            return transCoord;
        },
        transformPolygon: function (coords, projections, context) {
            var transCoord = [];

            // multiple Points
            _.each(coords, function (points) {
                _.each(points, function (point) {
                    transCoord.push(context.transformPoint(point, projections));
                });
            }, this);
            return [transCoord];
        },
        transformLine: function (coords, projections, context) {
            var transCoord = [];

            // multiple Points
                _.each(coords, function (point) {
                    transCoord.push(context.transformPoint(point, projections));
                }, this);
            return transCoord;
        },
        transformPoint: function (point, projections) {
            return proj4(projections.sourceProj, projections.destProj, point);
        }
    });

    return ImportTool;
});
