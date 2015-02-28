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
                "click .node-content > .folder-icons, .node-content > .folder-name": "toggleExpand",
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
                    _.each(this.model.get("childViews"), function (childNode) {
                        this.$(".tree-node-children").append(childNode.render().el);
                        childNode.$el.append(childNode.rendertwo().el);
                    }, this);
                    // Layer ohne Unterordner
                    _.each(this.model.get("layerViews"), function (layer) {
                        // Ich bin ein Layer direkt unter der Kategorie, also ohne Unterordner
                        // wird für das Styling gebraucht.
                        this.$(".tree-node-children").append(layer.render().el);
                    }, this);
                }
                else {
                    _.each(this.model.get("childViews"), function (layer) {
                        layer.remove();
                    }, this);
                    _.each(this.model.get("layerViews"), function (layer) {
                        layer.remove();
                    });
                }
                return this;
            },
            toggleExpand: function () {
                this.model.toggleExpand();
            },
            moveUpInList: function (evt) {
                this.model.moveUpInList();
            },
            moveDownInList: function () {
                this.model.moveDownInList();
            }
        });

        return TreeNodeView;
    });
