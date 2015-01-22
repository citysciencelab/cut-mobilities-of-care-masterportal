define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeNode.html',
    'views/TreeLayerView'
    ], function ($, _, Backbone, TreeNodeTemplate, TreeLayerView) {

        var TreeNodeView = Backbone.View.extend({
            className : 'list-group-item',
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

                if (this.model.get("isExpanded") === true) {console.log(8);
                    _.each(this.model.get("layerList"), function (layer) {
                        // console.log(layer);
                        var treeLayerView = new TreeLayerView({model: layer});
                        // console.log($("#"+this.model.get("id")));
                        this.$("ul").append(treeLayerView.render().el);
                        // this.$el.addClass("activColor");
                        this.$(".tree-node-parent").addClass("activColor");
                    }, this);
                }
                else {
                    this.$(".tree-node-parent").removeClass("activColor");
                    // this.$el.removeClass("activColor");
                }
                return this;
            },
            setExpandToTrue: function () {
                console.log("setExpandToTrue");
                this.model.setExpand(true);
            },
            setExpandToFalse: function () {
                console.log("setExpandToFalse");
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
