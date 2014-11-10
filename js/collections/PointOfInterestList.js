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
        setModel: function (clusterFeature, styleList) {
            // NOTE bisher nur Cluster-WFS
            _.each(clusterFeature.getProperties().features, function (feature) {
                var name = feature.getProperties().Name;;
                var kategorie = feature.getProperties().Kategorie;
                var lage = feature.getProperties().Lage;
                var xCoord = feature.getProperties().X_Wert;
                var yCoord = feature.getProperties().Y_Wert;
                var img = _.find(styleList.models, function (num) {
                    return num.attributes.name == kategorie;
                });
                this.add(new PointOfInterest({"name": name, "kategorie": kategorie, "lage": lage, "xCoord": xCoord, "yCoord": yCoord, "img": img.get('imagesrc')}));
            }, this);
        },
        removeAllModels: function () {
            this.reset();
        }
    });

    return new PointOfInterestList();
});
