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
                this.listenToOnce(this.model, "change:isExpanded", this.setParentView);
                this.listenTo(this.model, "change:isExpanded", this.render);
                this.listenTo(this.model, "change:viewList", this.render);
            },
            render: function () {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                if (this.model.get("isExpanded") === true) {
                    _.each(this.model.get("childViews"), function (view) {
                        this.$el.after(view.render().el);
                        if (view.model.get("type") === "nodeChild" && view.model.get("isExpanded") === true) {
                            view.renderChildren().el;
                        }
                    }, this);
                }
                else {
                    _.each(this.model.get("childViews"), function (view) {
                        view.remove();
                        if (view.model.get("type") === "nodeChild") {
                            _.each(view.model.get("childViews"), function (viewChild) {
                                viewChild.remove();
                            });
                        }
                    }, this);
                }
                return this;
            },
            setParentView: function () {
                _.each(this.model.get("childViews"), function (view) {
                    view.model.set("parentView", this);
                }, this);
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
