define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/TreeChildNode.html',
    'views/TreeLayerView'
    ], function ($, _, Backbone, TreeChildNodeTemplate, TreeLayerView) {

        var TreeChildNodeView = Backbone.View.extend({
            className : 'list-group-item node-child',
            tagName: 'li',
            template: _.template(TreeChildNodeTemplate),
            events: {
                "click div > .glyphicon-plus-sign, div > .glyphicon-folder-close, div > .glyphicon-minus-sign, div > .glyphicon-folder-open": "toggleExpand",
                "click .node-child-content > .folder-name, .folder-icons > .glyphicon-unchecked, .folder-icons > .glyphicon-check": "toggleVisibility"
            },
            initialize: function () {
                // this.listenTo(this.model, "change:isExpanded change:isVisible", this.render);
            },
            render: function () {
                this.stopListening();
                this.listenToOnce(this.model, "change:isExpanded change:isVisible", this.render);
                this.listenToOnce(this.model, "change:isExpanded change:isVisible", this.rendertwo);
                this.delegateEvents();

                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));

                return this;
            },
            rendertwo: function () {
                if (this.model.get("isExpanded") === true) {
                    _.each(this.model.get("layerView"), function (layer) {
                        this.$el.after(layer.render().el);
                    }, this);
                }
                else {
                    _.each(this.model.get("layerView"), function (layer) {
                        layer.remove();
                    }, this);
                }
                return this;
            },
            toggleVisibility: function () {
                this.model.toggleVisibility();
            },
            toggleExpand: function () {
                this.model.toggleExpand();
            }
        });

        return TreeChildNodeView;
    });
