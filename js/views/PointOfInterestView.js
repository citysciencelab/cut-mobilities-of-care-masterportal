define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/PointOfInterest.html',
    'models/PointOfInterestModal',
    'eventbus'
], function ($, _, Backbone, PointOfInterestTemplate, PointOfInterestModal, EventBus) {

    var MeasurePopupView = Backbone.View.extend({
        model: PointOfInterestModal,
        className: 'modal fade in',
        template: _.template(PointOfInterestTemplate),
        events: {
          'click .poiRow': 'onPOIClick',
            'click #500m': 'onClick500m',
            'click #1000m': 'onClick1000m',
            'click #2000m': 'onClick2000m',
        },
        initialize: function () {
            EventBus.on('showPOIModal', this.show, this, this);
        },
        onPOIClick: function (evt) {
            this.$el.modal('hide');
            newCenter=evt.target.title.split(',');
            newCenter.pop();
            EventBus.trigger('setCenter', [parseInt(newCenter[0],10),parseInt(newCenter[1],10)]);
        },
        onClick500m: function (evt) {
            EventBus.trigger('setOrientation', 500);
        },
        onClick1000m: function () {
            EventBus.trigger('setOrientation', 1000);
        },
        onClick2000m: function () {
            EventBus.trigger('setOrientation', 2000);
        },
        show: function (poiContent, StyleList, distance) {
            this.model.setAttributions(poiContent, StyleList);
            this.model.set('poiContent', poiContent);
            this.model.set('StyleList', StyleList);
            this.render();
            this.$el.modal({
                backdrop: 'static',
                show: true
            });
            $('#'+distance+'m a[href="#'+distance+'Meter"]').tab('show')

        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        }
    });

    return MeasurePopupView;
});
