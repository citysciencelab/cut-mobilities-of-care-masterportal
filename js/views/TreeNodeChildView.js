define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/TreeNodeChild.html"
], function ($, _, Backbone, TreeNodeChildTemplate) {

        var TreeNodeChildView = Backbone.View.extend({
            className : "list-group-item node-child",
            tagName: "li",
            template: _.template(TreeNodeChildTemplate),
            events: {
                "click .glyphicon-plus-sign, .glyphicon-minus-sign": "toggleExpand",
                "click .node-child-name, .glyphicon-unchecked, .glyphicon-check": "toggleSelected"
            },
            initialize: function () {
                this.$el.append(this.templateButton);
            },
            render: function () {
                this.stopListening();
                this.listenToOnce(this.model, "change:isExpanded change:isVisible change:settings change:transparence change:isSelected", this.render);
                this.listenToOnce(this.model, "change:isExpanded change:isVisible change:settings change:isSelected", this.renderChildren);
                this.delegateEvents();
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                return this;
            },
            renderChildren: function () {
                if (this.model.get("isExpanded") === true) {
                    _.each(this.model.get("childViews"), function (layer) {
                        layer.model.set("parentView", this);
                        this.$el.after(layer.render().el);
                    }, this);
                }
                else {
                    _.each(this.model.get("childViews"), function (layer) {
                        layer.remove();
                    }, this);
                }
                return this;
            },
            toggleVisibility: function () {
                this.model.toggleVisibility();
                this.model.toggleVisibilityChildren();
                this.toggleStyle();
            },
            toggleSelected: function () {
                this.model.toggleSelected();
                this.model.toggleSelectedChildren();
                this.toggleStyle();
            },
            toggleExpand: function () {
                this.model.toggleExpand();
            },

            checkSelectedOfAllChildren: function () {
                this.model.checkSelectedOfAllChildren();
                this.toggleStyle();
            },

            toggleStyle: function () {
                var someTrue = _.some(this.model.get("children"), function (model) {
                    return model.get("selected") === true;
                });
                if (someTrue === true) {
                    this.$el.css("color", "#fc8d62");
                }
                else {
                    this.$el.css("color", "rgb(150, 150, 150)");
                }
                this.model.get("parentView").toggleStyle();
            }

        });

        return TreeNodeChildView;
    });
