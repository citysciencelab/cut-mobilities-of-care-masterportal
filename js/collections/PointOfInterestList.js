define([
    'underscore',
    'backbone',
    'models/PointOfInterest',
    'eventbus',
    'config'
], function (_, Backbone, PointOfInterest, EventBus, Config) {

    var PointOfInterestList = Backbone.Collection.extend({
        initialize: function () {
            EventBus.on('setModel', this.setModel, this);
        },
        comparator: "distance",
        setModel: function (clusterFeature, styleList, maxDist, newCenter, layer) {
            // Cluster-WFS
            if(clusterFeature.getProperties().features){
            _.each(clusterFeature.getProperties().features, function (feature) {
                var name = feature.getProperties().name;
                var kategorie = feature.get(layer.attributes.styleField);
                var lineStringArray = [];
                lineStringArray.push(newCenter)
                poiObject=feature.getGeometry().flatCoordinates;
                if(poiObject.length==3){
                    poiObject.pop();
                }
                var xCoord=poiObject[0];
                var yCoord=poiObject[1];
                lineStringArray.push(poiObject);
                lineString= new ol.geom.LineString(lineStringArray);
                var distance = Math.round(lineString.getLength());
                var img;
                if(kategorie!=undefined){
                    img = _.find(styleList.models, function (num) {
                        return num.attributes.styleFieldValue == kategorie;
                    });
                }
                else{
                    img = _.find(styleList.models, function (num) {
                        return num.attributes.layerId == layer.attributes.id;
                    });
                }
                if(distance<=maxDist){
                    this.add(new PointOfInterest({"name": name, "kategorie": kategorie,"distance": distance, "img": img.get('imagepath')+img.get('imagename')}));
                }
            }, this);
            }
            //WFS ohne Cluster
            else{
                var feature=clusterFeature;
                var name = feature.getProperties().name;
                var lineStringArray = [];
                lineStringArray.push(newCenter)
                poiObject=feature.getGeometry().flatCoordinates;
                if(poiObject.length==3){
                    poiObject.pop();
                }
                var xCoord=poiObject[0];
                var yCoord=poiObject[1];
                lineStringArray.push(poiObject);
                lineString= new ol.geom.LineString(lineStringArray);
                var distance = Math.round(lineString.getLength());
                var img = _.find(styleList.models, function (num) {
                    return num.attributes.layerId == layer.attributes.id;
                });
                if(distance<=maxDist){
                    this.add(new PointOfInterest({"name": name, "distance": distance, "img": img.get('imagepath')+img.get('imagename')}));
                }
            }


        },
        removeAllModels: function () {
            this.reset();
        }
    });

    return new PointOfInterestList();
});
