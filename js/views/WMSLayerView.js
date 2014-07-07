define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/WMSLayer.html',
    'eventbus',
    'jquery_ui',
    'jquery_ui_touch'
], function ($, _, Backbone, wmsLayerTemplate, EventBus) {

    var WMSLayerView = Backbone.View.extend({
        className : 'list-group-item',
        tagName: 'li',
        template: _.template(wmsLayerTemplate),
        initialize: function () {
            this.listenTo(this.model, 'change:visibility', this.render);
        },
        events: {
            'slide': 'updateOpacity',
            'click span.glyphicon-info-sign': 'getMetadata',
            'click .glyphicon-check, .glyphicon-unchecked': 'toggleVisibility',
            'click .glyphicon-arrow-up, .glyphicon-arrow-down': 'moveLayer',
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
        },
        getMetadata: function () {
            window.open('http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=' + this.model.get('uuid'), "_blank");
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $(".layer-slider").slider();
            return this;
        }
    });

    return WMSLayerView;
});
