define([
    'underscore',
    'backbone',
    'openlayers'
], function (_, Backbone, ol) {


    var PointOfInterest = Backbone.Model.extend({
        defaults:{
        poiContent: [],
        name: [],
        kategorie: [],
        coord: [],
        img: []
        },
        setAttributions: function(poiContent, StyleList){
            this.set('name', []);
            this.set('kategorie', []);
            this.set('coord', []);
            this.set('img', []);

            _.each(poiContent, function(feature) {
                var featureCluster=feature.getProperties();
                _.each(featureCluster.features, function(element,index) {
                this.get('name').push(element.getProperties().Name);
                this.get('kategorie').push(element.getProperties().Kategorie);
                this.get('coord').push(element.getGeometry().getCoordinates());

                var img=_.find(StyleList.models, function (num) {
                        return num.attributes.name == element.getProperties().Kategorie;
                });
                this.get('img').push(img.get('imagesrc'));
                },this)
            },this);
        }


    });

    return new PointOfInterest();
});
