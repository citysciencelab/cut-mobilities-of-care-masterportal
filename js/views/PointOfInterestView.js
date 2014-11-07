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
        id: 'base-modal',
        className: 'modal fade in',
        template: _.template(PointOfInterestTemplate),
        events: {
          'click .poiRow': 'onPOIClick'
//            'click button': 'activateDraw'
        },
        initialize: function () {
            EventBus.on('showPOIModal', this.show, this);
//            this.render();
        },
        onPOIClick: function (evt) {

            this.$el.modal('hide');
            newCenter=evt.target.title.split(',');
            newCenter.pop();
            console.log(evt.target);
            //console.log(this.model);
            EventBus.trigger('setCenter', [parseInt(newCenter[0],10),parseInt(newCenter[1],10)]);
        },
        show: function (poiContent, StyleList) {
            this.model.setAttributions(poiContent, StyleList);
            this.model.set('poiContent', poiContent);
            this.model.set('StyleList', StyleList);
            this.render();
            this.$el.modal({
                backdrop: 'static',
                show: true
            });
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        }
    });

    return MeasurePopupView;
});
