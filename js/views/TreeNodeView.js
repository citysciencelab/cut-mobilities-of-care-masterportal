define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeNode.html'
    ], function ($, _, Backbone, TreeNodeTemplate) {

        var TreeNodeView = Backbone.View.extend({
            className : 'list-group-item node',
            tagName: 'li',
            template: _.template(TreeNodeTemplate),
            events: {
                "click .node-content": "toggleExpand",
                "click .node-button > .glyphicon": "moveInList"
            },
            initialize: function () {
                this.listenTo(this.model, "change:isExpanded", this.render);
                this.listenTo(this.model, "change:viewList", this.render);
            },
            render: function () {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                if (this.model.get("isExpanded") === true) {
                    _.each(this.model.get("childViews"), function (child) {
                        this.$el.after(child.render().el);
                        if (child.model.get("type") === "node" && child.model.get("isExpanded") === true) {
                            child.renderChildren().el;
                        }
                    }, this);
                }
                else {
                    _.each(this.model.get("childViews"), function (child) {
                        child.remove();
                        if (child.model.get("type") === "node") {
                            _.each(child.model.get("layerView"), function (view) {
                                view.remove();
                            });
                        }
                    }, this);
                }
                return this;
            },
            toggleExpand: function () {
                this.model.toggleExpand();
            },
            moveInList: function (evt) {
                if (evt.target.classList[1] === "glyphicon-arrow-up") {
                    this.model.moveUpInList();
                }
                else if (evt.target.classList[1] === "glyphicon-arrow-down") {
                    this.model.moveDownInList();
                }
            }
        });

        return TreeNodeView;
    });
