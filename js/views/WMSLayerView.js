define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/WMSLayer.html',
    'eventbus'
], function ($, _, Backbone, wmsLayerTemplate, EventBus) {

    var WMSLayerView = Backbone.View.extend({
        className : 'list-group-item',
        tagName: 'li',
        template: _.template(wmsLayerTemplate),
        initialize: function () {
            this.listenTo(this.model, 'change:visibility', this.render);
            this.listenTo(this.model, 'change:transparence', this.render);
            this.listenTo(this.model, 'change:settings', this.render);
        },
        events: {
            'click .glyphicon-plus-sign': 'upTransparence',
            'click .glyphicon-minus-sign': 'downTransparence',
            'click span.glyphicon-info-sign': 'getMetadata',
            'click .glyphicon-check, .glyphicon-unchecked': 'toggleVisibility',
            'click .glyphicon-upload, .glyphicon-download': 'moveLayer',
            'click .glyphicon-refresh': 'toggleSettings'
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
        upTransparence: function (evt) {
            this.model.setUpTransparence(10);
        },
        downTransparence: function (evt) {
            this.model.setDownTransparence(10);
        },
        toggleVisibility: function (evt) {
            this.model.toggleVisibility();
        },
        getMetadata: function () {
            window.open('http://hmdk.de/trefferanzeige?docuuid=' + this.model.get('metaID'), "_blank");
        },
        toggleSettings: function () {
            this.model.toggleSettings();
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            return this;
        }
    });

    return WMSLayerView;
});
