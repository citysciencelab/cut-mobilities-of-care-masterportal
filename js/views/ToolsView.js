/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Tools.html',
    'bootstrap'
], function ($, _, Backbone, ToolsTemplate) {

    var ToolsView = Backbone.View.extend({
        el: '#tools',
        template: _.template(ToolsTemplate),
        initialize: function () {
            this.render();
        },
        events: {
            'click #coords': 'getCoordinate'
        },
        getCoordinate: function () {
            console.log('und nu');
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.append(this.template(attr));
        }
    });

    return ToolsView;
});