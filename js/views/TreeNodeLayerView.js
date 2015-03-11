define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeNodeLayer.html',
    'text!templates/TreeNodeLayerSetting.html',
    'eventbus'
    ], function ($, _, Backbone, TreeNodeLayerTemplate, TreeNodeLayerSettingTemplate, EventBus) {

        var TreeNodeLayerView = Backbone.View.extend({
            className : 'list-group-item node-layer',
            tagName: 'li',
            template: _.template(TreeNodeLayerTemplate),
            templateSetting: _.template(TreeNodeLayerSettingTemplate),
            templateButton: _.template("<div class='node-layer-button pull-right'><span class='glyphicon glyphicon-cog rotate'></span></div>"),
            events: {
                'click .glyphicon-plus-sign': 'upTransparence',
                'click .glyphicon-minus-sign': 'downTransparence',
                'click .glyphicon-info-sign': 'getMetadata',
                'click .check, .unchecked, .layer-name': 'toggleVisibility',
                "click .node-layer-button": "toggleSettings",
                "click .glyphicon-arrow-up, .glyphicon-arrow-down": "moveLayer"
            },
            initialize: function () {
                this.$el.append(this.templateButton);
            },
            render: function (model) {
                this.stopListening();
                this.listenToOnce(this.model, 'change:visibility', this.render);
                this.listenToOnce(this.model, 'change:visibility', this.toggleStyle);
                this.listenToOnce(this.model, 'change:transparence', this.render);
                this.listenToOnce(this.model, 'change:settings', this.render);
                this.delegateEvents();

                this.$(".node-layer-content").remove();
                this.$(".node-layer-settings").remove();

                var attr = this.model.toJSON();
                if (this.model.hasChanged("settings") === true && model !== undefined) {
                    if (this.model.get("settings") === true) {
                        this.$el.find(".node-layer-button").after(this.templateSetting(attr));
                    }
                    else {
                        this.$el.find(".node-layer-button").after(this.template(attr));
                    }
                }
                else if (this.model.hasChanged("transparence") === true && model !== undefined) {
                    this.$el.find(".node-layer-button").after(this.templateSetting(attr));
                }
                else {
                    if (this.model.get("settings") === true) {
                        this.$el.find(".node-layer-button").after(this.templateSetting(attr));
                    }
                    else {
                        this.$el.find(".node-layer-button").after(this.template(attr));
                    }
                }
                return this;
            },

            /**
             * Bewegt den Layer im LayerBaum eine Ebene nach oben oder unten. Zusätzlich wird eine Event an map.js "getriggert",
             * welches den Layer auf der Karte in der Ebene verschiebt. Anschließend wird die TreeNode neu gezeichnet.
             */
            "moveLayer": function (evt) {
                // Springt der Layer eine Ebene höher oder tiefer
                var counter;
                if (evt.target.className === "glyphicon glyphicon-arrow-up") {
                    counter = 1;
                }
                else if (evt.target.className === "glyphicon glyphicon-arrow-down") {
                    counter = -1;
                }
                // Die ParentView --> TreeNodeView
                var parentView = this.model.get("parentView");
                // Alle zur ParentView gehörende ChildViews ( --> TreeNodeLayer und TreeNodeChildLayer)
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
                        EventBus.trigger('moveLayer', [counter, this.model.get('layer')]);
                    }
                    // zeichnet die ParentViews neu
                    this.model.get("parentView").render();
                }
            },

            upTransparence: function (evt) {
                this.model.setUpTransparence(10);
            },
            downTransparence: function (evt) {
                this.model.setDownTransparence(10);
            },
            toggleVisibility: function (evt) {
                this.model.toggleVisibility();
            },
            getMetadata: function () {
                window.open('http://hmdk.de/trefferanzeige?docuuid=' + this.model.get('metaID'), "_blank");
            },
            toggleSettings: function () {
                this.model.toggleSettings();
                this.$('.glyphicon-cog').toggleClass('rotate2');
                this.$('.glyphicon-cog').toggleClass('rotate');
            },
            toggleStyle: function () {
                if (this.model.get("visibility") === true) {
                    this.$el.css("color", "#fc8d62");
                }
                else {
                    this.$el.css("color", "#333333");
                }
                this.model.get("parentView").toggleStyle();
            }
        });

        return TreeNodeLayerView;
    });
