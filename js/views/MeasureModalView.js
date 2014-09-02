define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/MeasureModal.html',
    'models/MeasureModal',
    'eventbus'
], function ($, _, Backbone, MeasureModalTemplate, MeasureModal, EventBus) {

    var MeasurePopupView = Backbone.View.extend({
        model: MeasureModal,
        id: 'base-modal',
        className: 'modal fade in',
        template: _.template(MeasureModalTemplate),
        events: {
            'click input[type=radio]': 'onRadioClick',
            'click button': 'activateDraw'
        },
        initialize: function () {
            EventBus.on('showMeasureModal', this.show, this);
            this.render();
        },
        onRadioClick: function (evt) {
            this.model.setType(evt.target.value);
        },
        activateDraw: function () {
            if (this.model.get('type') !== undefined) {
                EventBus.trigger('activateDraw', this.model.get('type'));
                this.$el.modal('hide');
            }
        },
        show: function () {
            this.$el.modal({
                backdrop: 'static',
                show: true
            });
        },
        render: function () {
            this.$el.html(this.template());
        }
    });

    return MeasurePopupView;
});