define([
    "backbone",
    "text!modules/tree/catalogLayer/templateNode.html"
    ], function (Backbone, NodeTemplate) {

        var NodeView = Backbone.View.extend({
            className: "list-group-item node",
            tagName: "li",
            template: _.template(NodeTemplate),
            events: {
                "click .node-content": "toggleExpand"
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
                this.toggleStyle();
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
            toggleStyle: function () {
                var someTrue = _.some(this.model.get("layerList"), function (model) {
                    return model.get("selected") === true;
                });

                if (someTrue === true) {
                    this.$el.css("color", "rgb(255, 127, 0)");
                }
                else {
                    this.$el.css("color", "rgb(85, 85, 85)");
                }
            }
        });

        return NodeView;
    });
