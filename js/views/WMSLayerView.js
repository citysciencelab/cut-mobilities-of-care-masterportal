define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/WMSLayer.html',
    'eventbus',
    'jquery_ui'
], function ($, _, Backbone, wmsLayerTemplate, EventBus) {

    var WMSLayerView = Backbone.View.extend({
        className : 'list-group-item',
        tagName: 'li',
        template: _.template(wmsLayerTemplate),
        initialize: function () {
            this.listenTo(this.model, 'change:visibility', this.test);
        },
        events: {
            'slide': 'updateOpacity',
            'click span.glyphicon-info-sign': 'getMetadata',
            'click span.glyphicon-check': 'toggleVisibility',
            'click span.glyphicon-unchecked': 'toggleVisibility',
            'click span.glyphicon-arrow-up': 'moveLayer',
            'click span.glyphicon-arrow-down': 'moveLayer',
        },
        moveLayer: function (evt) {
            var className = evt.currentTarget.className;
            if (className.search('down') !== -1) {
                EventBus.trigger('moveLayer', [-1, this.model.get('layer')]);
            }
            else if (className.search('up') !== -1) {
                EventBus.trigger('moveLayer', [1, this.model.get('layer')]);
            }
        },
        updateOpacity: function (evt, ui) {
            this.model.updateOpacity(ui.value);
        },
        toggleVisibility: function (evt) {
            this.model.toggleVisibility();
            this.render();
        },
        getMetadata: function () {
            window.open('http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=' + this.model.get('uuid'), "_blank");
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $(".layer-slider").slider();
            return this;
        },
        test: function (model) {
            this.render();
        }
    });

    return WMSLayerView;
});
