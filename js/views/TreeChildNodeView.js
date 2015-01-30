define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeChildNode.html',
    'views/TreeLayerView'
    ], function ($, _, Backbone, TreeChildNodeTemplate, TreeLayerView) {

        var TreeChildNodeView = Backbone.View.extend({
            className : 'list-group-item tree-node',
            tagName: 'li',
            template: _.template(TreeChildNodeTemplate),
            events: {
                "click .glyphicon-plus-sign, .glyphicon-folder-close": "setExpandToTrue",
                "click .glyphicon-minus-sign, .glyphicon-folder-open": "setExpandToFalse"
                // "click .glyphicon-arrow-up": "moveUpInList",
                // "click .glyphicon-arrow-down": "moveDownInList",
            },
            initialize: function () {
                this.listenTo(this.model, "change:isExpanded", this.render);
            },
            render: function () {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));

                if (this.model.get("isExpanded") === true) {
var test = [];
                    _.each(this.model.get("layerList"), function (layer) {
                        var treeLayerView = new TreeLayerView({model: layer});
                        this.$el.after(treeLayerView.render().el);
                        test.push(treeLayerView);
                        // this.$(".tree-node-parent-test").addClass("activColor");
                    }, this);
                    this.model.set("test", test);
                }
                else {
                    _.each(this.model.get("test"), function (layer) {
                        console.log(layer);
                        layer.remove();
                        // var treeLayerView = new TreeLayerView({model: layer});
                        // this.$el.after(treeLayerView.render().el);
                        // this.$(".tree-node-parent-test").addClass("activColor");
                    }, this);
                }
                return this;
            },
            test: function (evt) {
                console.log(evt);
            },
            setExpandToTrue: function () {
                this.model.setExpand(true);
            },
            setExpandToFalse: function () {
                this.model.setExpand(false);
            }
        });

        return TreeChildNodeView;
    });
