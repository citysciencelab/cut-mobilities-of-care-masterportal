define([
    'underscore',
    'backbone',
    'models/PointOfInterest',
    'eventbus'
], function (_, Backbone, PointOfInterest, EventBus) {

    var PointOfInterestList = Backbone.Collection.extend({
        initialize: function () {
            EventBus.on('setModel', this.setModel, this);
        },
        comparator: "distance",
        setModel: function (clusterFeature, styleList, maxDist, newCenter) {
            // NOTE bisher nur Cluster-WFS
            _.each(clusterFeature.getProperties().features, function (feature) {
                var name = feature.getProperties().Name;
                var kategorie = feature.getProperties().Kategorie;
                var lage = feature.getProperties().Lage;
                //var xCoord = feature.getProperties().X_Wert;
                //var yCoord = feature.getProperties().Y_Wert;
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
                    return num.attributes.styleFieldValue == kategorie;
                });
                if(distance<=maxDist){
                    this.add(new PointOfInterest({"name": name, "kategorie": kategorie, "lage": lage, "xCoord": xCoord, "yCoord": yCoord, "distance": distance, "img": img.get('imagepath')+img.get('imagename')}));
                }
            }, this);
        },
        removeAllModels: function () {
            this.reset();
        }
    });

    return new PointOfInterestList();
});
