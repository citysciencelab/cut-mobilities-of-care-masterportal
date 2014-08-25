define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers'
], function (_, Backbone, EventBus, ol) {

    var MeasurePopup = Backbone.Model.extend({
        initialize: function () {
            EventBus.on('activateDraw', this.setGeometrieType, this);
            this.set('source', new ol.source.Vector());
            this.set('layer', new ol.layer.Vector({
                source: this.get('source')
            }));
        },
        setGeometrieType: function (value) {
            this.set('draw', new ol.interaction.Draw({
                source: this.get('source'),
                type: value
            }));
            EventBus.trigger('activateClick', 'measure');
            this.get('draw').on('drawstart', this.deleteGeometries, this);
            this.get('draw').on('drawend', this.getResult, this);
        },
        deleteGeometries: function () {
            var features = this.get('source').getFeatures();
            if (features.length > 0) {
                this.get('source').removeFeature(features[0]);
            }
        },
        getResult: function (evt) {
            if (evt.feature.getGeometry().getType() === 'LineString') {
                this.formatLength(evt.feature.getGeometry())
            }
            else {
                this.formatArea(evt.feature.getGeometry())
            }
        },
        formatLength: function (line) {
            var length = Math.round(line.getLength() * 100) / 100;
            var output;
            if (length > 100) {
                output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
            }
            else {
                output = (Math.round(length * 100) / 100) + ' ' + 'm';
            }
            this.set('result', 'Länge: ' + output);
        },
        formatArea: function (polygon) {
            var area = polygon.getArea();
            var output;
            if (area > 10000) {
                output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
            } else {
                output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
            }
            this.set('result', 'Fläche: ' + output);
        }
    });

    return new MeasurePopup();
});
