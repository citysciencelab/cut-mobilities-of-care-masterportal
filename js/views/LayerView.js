define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Layer.html',
    'eventbus'
], function ($, _, Backbone, LayerTemplate, EventBus) {

    var LayerView = Backbone.View.extend({
        className : 'list-group-item',
        tagName: 'li',
        template: _.template(LayerTemplate),
        initialize: function () {
            this.listenTo(this.model, 'change:visibility', this.render);
            this.listenTo(this.model, 'change:transparence', this.render);
            this.listenTo(this.model, 'change:settings', this.render);
        },
        events: {
            'click .plus': 'upTransparence',
            'click .minus': 'downTransparence',
            'click .info': 'getMetadata',
            'click .check, .unchecked, small': 'toggleVisibility',
//            'click .upload, .download': 'moveLayer',
            'click .refresh': 'toggleSettings'
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
            if (this.model.get('displayInTree') === true) {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                return this;
            }else {
                return '';
            }
        }
    });

    return LayerView;
});
