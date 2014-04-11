/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/WMSLayer.html',
    'bootstrap',
], function ($, _, Backbone, wmsLayerTemplate) {

    var WMSLayerView = Backbone.View.extend({
        className : 'list-group-item',
        tagName: 'li',
        template: _.template(wmsLayerTemplate),
        events: {
            'change input[type=checkbox]': 'toggleVisibility',
            'input input[type=range]': 'updateOpacity',
            'click span.glyphicon': 'getMetadata'
        },
        updateOpacity: function (evt) {
            this.model.updateOpacity(evt.currentTarget.value);
        },
        toggleVisibility: function () {
            this.model.toggleVisibility();
        },
        getMetadata: function () {
            window.open('http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=' + this.model.get('uuid'), "_blank");
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            return this;
        }
    });

    return WMSLayerView;
});
