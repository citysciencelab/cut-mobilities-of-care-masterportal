define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeNodeChild.html',
    'text!templates/TreeNodeChildSetting.html',
    'views/TreeNodeChildLayerView',
    "eventbus"
], function ($, _, Backbone, TreeNodeChildTemplate, TreeNodeChildSettingTemplate, TreeLayerView, EventBus) {

        var TreeNodeChildView = Backbone.View.extend({
            className : 'list-group-item node-child',
            tagName: 'li',
            template: _.template(TreeNodeChildTemplate),
            templateSetting: _.template(TreeNodeChildSettingTemplate),
            templateButton: _.template("<div class='node-child-button pull-right'><span class='glyphicon glyphicon-cog rotate'></span></div>"),
            events: {
                "click .folder-icons > .glyphicon-plus-sign, .folder-icons > .glyphicon-folder-close, .folder-icons > .glyphicon-minus-sign, .folder-icons > .glyphicon-folder-open": "toggleExpand",
                "click .node-child-name, .glyphicon-unchecked, .glyphicon-check": "toggleVisibility",
                "click .glyphicon-arrow-up": "moveLayer",
                "click .glyphicon-arrow-down": "moveLayer",
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
                // this.listenToOnce(this.model, "change:isVisible", this.toggleStyle);
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
                    _.each(this.model.get("childViews"), function (layer) {
                        // console.log(layer);
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
            },

            /**
             * Bewegt den Layer im LayerBaum innerhalb der entsprechenden TreeNodeChild eine Ebene nach oben oder unten. Zusätzlich wird eine Event an map.js "getriggert",
             * welches den Layer auf der Karte in der Ebene verschiebt. Anschließend wird die TreeNodeChild neu gezeichnet.
             */
            "moveLayer": function (evt) {
                // Springt der Layer eine oder mehrere Ebene/n höher oder tiefer
                var counter;
                if (evt.target.className === "glyphicon glyphicon-arrow-up") {
                    counter = this.model.get("childViews").length;
                }
                else if (evt.target.className === "glyphicon glyphicon-arrow-down") {
                    counter = -1;
                }
                // Die ParentView --> TreeNodeView
                var parentView = this.model.get("parentView");
                // Alle zur ParentView gehörende ChildViews ( --> alle entsprechende TreeNodeChildLayer)
                var childViews = parentView.model.get("childViews");
                // Der aktuelle Index dieser View innerhalb der ChildViews der ParentView
                var fromIndex = _.indexOf(childViews, this);
                // Der neue Index für diese View
                var toIndex = fromIndex + counter;
                // Bewege diese View nur innerhalb der Range der ChildViews
                if (toIndex < childViews.length && toIndex >= 0) {
                    // counter für den Trigger an Map.js
                    // Hat der Nachbarknoten nur einen Layer musst das Event nur 1x getriggert werden.
                    var loopCounter = 1;
                    // Ist der Nachbarknoten ein "TreeNodeChild" erhöhe den loopCounter um die Anzahl seiner "Children"
                    if (childViews[toIndex].model.get("type") === "nodeChild") {
                        loopCounter = childViews[toIndex].model.get("children").length
                    }
                    // löscht diese View aus den ChildViews und fügt sie an neuer Stelle wieder hinzu
                    childViews.splice(toIndex, 0, childViews.splice(fromIndex, 1)[0]);
                    // bewegt den Layer auf der Karte --> Map.js
                    for (var i = 0; i < loopCounter; i += 1) {
                        _.each(this.model.get("childViews"), function (childView) {
                            EventBus.trigger('moveLayer', [counter, childView.model.get('layer')]);
                        });
                    }
                    // zeichnet die ParentViews neu
                    this.model.get("parentView").render();
                }
            },

            checkVisibilityOfAllChildren: function () {
                this.model.checkVisibilityOfAllChildren();
                this.toggleStyle();
            },

            toggleStyle: function () {
                console.log(this.model);
                var someTrue = _.some(this.model.get("children"), function (model) {
                    return model.get("visibility") === true;
                });
                if (someTrue === true) {
                    this.$el.css("color", "#fc8d62");
                }
                else {
                    this.$el.css("color", "#333333");
                }
                this.model.get("parentView").toggleStyle();
            }

        });

        return TreeNodeChildView;
    });
