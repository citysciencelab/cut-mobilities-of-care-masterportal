define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeNode.html',
    'views/TreeLayerView',
    'views/TreeChildNodeView',
    'models/TreeChildNode'
    ], function ($, _, Backbone, TreeNodeTemplate, TreeLayerView, TreeChildNodeView, TreeChildNode) {

        var TreeNodeView = Backbone.View.extend({
            className : 'list-group-item tree-node',
            tagName: 'li',
            template: _.template(TreeNodeTemplate),
            events: {
                "click .glyphicon-plus-sign, .glyphicon-folder-close": "setExpandToTrue",
                "click .glyphicon-minus-sign, .glyphicon-folder-open": "setExpandToFalse",
                "click .glyphicon-arrow-up": "moveUpInList",
                "click .glyphicon-arrow-down": "moveDownInList"
            },
            initialize: function () {
                this.listenTo(this.model, "change:isExpanded", this.render);
            },
            render: function () {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));

                if (this.model.get("isExpanded") === true) {
                    // ChildNodes
                    _.each(this.model.get("childNodes"), function (childNode) {
                        var treeChildNodeView = new TreeChildNodeView({model: new TreeChildNode(childNode)});
                        this.$("ul").append(treeChildNodeView.render().el);
                    }, this);
                    // Layer ohne Unterordner
                    _.each(this.model.get("layerListByTreeNode"), function (layer) {
                        var treeLayerView = new TreeLayerView({model: layer});
                        this.$("ul").append(treeLayerView.render().el);
                        this.$(".tree-node-parent").addClass("activColor");
                    }, this);
                }
                else {
                    this.$(".tree-node-parent").removeClass("activColor");
                }
                return this;
            },
            setExpandToTrue: function () {
                this.model.setExpand(true);
            },
            setExpandToFalse: function () {
                this.model.setExpand(false);
            },
            moveUpInList: function () {
                this.model.moveUpInList();
            },
            moveDownInList: function () {
                this.model.moveDownInList();
            }
        });

        return TreeNodeView;
    });
