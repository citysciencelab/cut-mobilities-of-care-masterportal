define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeChildNode.html',
    'text!templates/TreeChildNodeSetting.html',
    'views/TreeNodeChildLayerView'
    ], function ($, _, Backbone, TreeChildNodeTemplate, TreeChildNodeSettingTemplate, TreeLayerView) {

        var TreeNodeChildView = Backbone.View.extend({
            className : 'list-group-item node-child',
            tagName: 'li',
            template: _.template(TreeChildNodeTemplate),
            templateSetting: _.template(TreeChildNodeSettingTemplate),
            templateButton: _.template("<div class='node-child-button pull-right'><span class='glyphicon glyphicon-cog rotate'></span></div>"),
            events: {
                "click .folder-icons > .glyphicon-plus-sign, .folder-icons > .glyphicon-folder-close, .folder-icons > .glyphicon-minus-sign, .folder-icons > .glyphicon-folder-open": "toggleExpand",
                "click .node-child-name, .glyphicon-unchecked, .glyphicon-check": "toggleVisibility",
                "click .node-child-arrows": "moveInList",
                "click .node-child-button": "toggleSettings",
                "click .node-child-settings > .glyphicon-plus-sign": "setUpTransparence",
                "click .node-child-settings > .glyphicon-minus-sign": "setDownTransparence"
            },
            initialize: function () {
                this.$el.append(this.templateButton);
            },
            render: function () {
                this.stopListening();
                this.listenToOnce(this.model, "change:isExpanded change:isVisible change:settings change:transparence", this.render);
                this.listenToOnce(this.model, "change:isExpanded change:isVisible change:settings", this.renderChildren);
                this.delegateEvents();
                this.$(".node-child-settings").remove();
                this.$(".node-child-content").remove();
                var attr = this.model.toJSON();
                if (this.model.get("settings") === false) {
                    this.$el.find(".node-child-button").after(this.template(attr));
                }
                else {
                    this.$el.find(".node-child-button").after(this.templateSetting(attr));
                }
                return this;
            },
            renderChildren: function () {
                if (this.model.get("isExpanded") === true) {
                    _.each(this.model.get("layerView"), function (layer) {
                        layer.model.set("parentNode", this.model);
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
                this.model.toggleVisibilityChildren();
            },
            toggleExpand: function () {
                this.model.toggleExpand();
            },
            toggleSettings: function () {
                this.model.toggleSettings();
                this.$('.glyphicon-cog').toggleClass('rotate2');
                this.$('.glyphicon-cog').toggleClass('rotate');
            },
            setUpTransparence: function () {
                this.model.setUpTransparence(10);
            },
            setDownTransparence: function () {
                this.model.setDownTransparence(10);
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

        return TreeNodeChildView;
    });
