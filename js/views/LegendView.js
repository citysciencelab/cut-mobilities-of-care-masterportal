define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Legend.html',
    'models/Legend',
    'eventbus'
], function ($, _, Backbone, LegendTemplate, Legend, EventBus) {

    var LegendView = Backbone.View.extend({
        model: Legend,
        id: 'base-modal',
        className: 'modal fade bs-example-modal-sm',
        template: _.template(LegendTemplate),
        initialize: function () {
            this.render();
            EventBus.on('toggleLegendWin', this.toggleLegendWin, this);
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);
        },
        events: {
           'click button': 'onLegendClick'
        },
        show: function (params) {
            this.model.setAttributions(params);
            this.render();
            this.$el.modal({
                backdrop: 'static',
                show: true
            });
        },

        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        onLegendClick: function(){
        },
        toggleLegendWin: function (){
            var map = this.model.get('map');
            var layersVisible, gfiParams = [], layers;
            layers = map.getLayers().getArray();
            layersVisible = _.filter(layers, function (element) {
                // NOTE GFI-Filter Nur Sichtbar
                return element.getVisible() === true;
            });
            _.each(layersVisible, function (element) {
                if (element.getProperties().typ === 'WFS') {
                    gfiParams.push({
                        typ: 'WFS',
                        source: element.getSource(),
                        name: element.get('name'),
                        attributes: element.get('gfiAttributes')
                    });
                }
            });
            this.show(gfiParams);
        },
        setMap: function (map) {
            this.model.set('map', map);
        }
    });

    return LegendView;
});

            //EventBus.trigger('showLegend', gfiParams);
