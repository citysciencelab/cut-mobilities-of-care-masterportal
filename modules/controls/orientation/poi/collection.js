define([
    "backbone",
    "backbone.radio",
    "modules/controls/orientation/poi/feature/model",
    "openlayers"
], function (Backbone, Radio, PointOfInterest, ol) {

    var PointOfInterestList = Backbone.Collection.extend({
        initialize: function () {
            this.listenTo(Radio.channel("Orientation"), {
                "setModel": this.setModel
            });
        },
        comparator: "distance",
        setModel: function (clusterFeature, maxDist, newCenter, layer) {
            var styleModels = Radio.request("StyleList", "returnModels");

            // Cluster-WFS
            if (clusterFeature.getProperties().features) {
            _.each(clusterFeature.getProperties().features, function (feature) {
                var name = feature.getProperties().name,
                    kategorie = feature.get(layer.attributes.styleField),
                    lineStringArray = [];

                lineStringArray.push(newCenter);
                var poiObject = feature.getGeometry().getCoordinates();

                if (poiObject.length === 3) {
                    poiObject.pop();
                }
                var xCoord = poiObject[0],
                    yCoord = poiObject[1];

                lineStringArray.push(poiObject);
                var lineString = new ol.geom.LineString(lineStringArray),
                    distance = Math.round(lineString.getLength()),
                    img;

                if (kategorie !== undefined) {
                    img = _.find(styleModels, function (num) {
                        return num.attributes.styleFieldValue === kategorie;
                    });
                }
                else {
                    img = _.find(styleModels, function (num) {
                        return num.attributes.layerId === layer.attributes.id;
                    });
                }
                if (distance <= maxDist && img) {
                    this.add(new PointOfInterest({
                        name: name,
                        kategorie: kategorie,
                        distance: distance,
                        img: img.get("imagepath") + img.get("imagename"),
                        xCoord: xCoord,
                        yCoord: yCoord
                    }));
                    }
            }, this);
            }
            // WFS ohne Cluster
            else {
                var feature = clusterFeature,
                    name = feature.getProperties().name,
                    lineStringArray = [];

                lineStringArray.push(newCenter);
                var poiObject = feature.getGeometry().getCoordinates();

                if (poiObject.length === 3) {
                    poiObject.pop();
                }
                var xCoord = poiObject[0],
                    yCoord = poiObject[1];

                lineStringArray.push(poiObject);
                var lineString = new ol.geom.LineString(lineStringArray),
                    distance = Math.round(lineString.getLength()),
                    img = _.find(styleModels, function (num) {
                        return num.attributes.layerId === layer.attributes.id;
                    });
                
                if (distance <= maxDist) {
                    this.add(new PointOfInterest({
                        name: name,
                        distance: distance,
                        img: img.get("imagepath") + img.get("imagename"),
                        xCoord: xCoord,
                        yCoord: yCoord
                    }));
                }
            }
        },
        removeAllModels: function () {
            this.reset();
        }
    });

    return new PointOfInterestList();
});
