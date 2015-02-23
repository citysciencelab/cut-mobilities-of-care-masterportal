define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeNodeChildLayer.html',
    'text!templates/TreeNodeChildLayerSetting.html',
    'eventbus'
    ], function ($, _, Backbone, TreeNodeChildLayerTemplate, TreeNodeChildLayerSettingTemplate, EventBus) {

        var TreeNodeChildLayerView = Backbone.View.extend({
            className : 'list-group-item node-child-layer',
            tagName: 'li',
            template: _.template(TreeNodeChildLayerTemplate),
            templateSetting: _.template(TreeNodeChildLayerSettingTemplate),
            templateButton: _.template("<div class='node-child-layer-button pull-right'><span class='glyphicon glyphicon-cog rotate'></span></div>"),
            events: {
                'click .glyphicon-plus-sign': 'upTransparence',
                'click .glyphicon-minus-sign': 'downTransparence',
                'click .glyphicon-info-sign': 'getMetadata',
                'click .check, .unchecked, .layer-name': 'toggleVisibility',
                "click .node-child-layer-button": "toggleSettings",
                "click .glyphicon-arrow-up, .glyphicon-arrow-down": "moveLayer"
            },
            initialize: function () {
                this.$el.append(this.templateButton);
            },
            render: function (model) {
                this.stopListening();
                this.listenToOnce(this.model, 'change:visibility', this.render);
                this.listenToOnce(this.model, 'change:transparence', this.render);
                this.listenToOnce(this.model, 'change:settings', this.render);
                this.delegateEvents();
                this.$(".wrapper-node-child-layer").remove();

                var attr = this.model.toJSON();

                if (this.model.hasChanged("settings") === true && model !== undefined) {
                    if (this.model.get("settings") === true) {
                        this.$el.find(".node-child-layer-button").after(this.templateSetting(attr));
                    }
                    else {
                        this.$el.find(".node-child-layer-button").after(this.template(attr));
                    }
                }
                else if (this.model.hasChanged("transparence") === true && this.model.hasChanged("settings") === true && model !== undefined) {console.log(888);
                    this.$el.find(".node-child-layer-button").after(this.templateSetting(attr));
                }
                else {
                    if (this.model.get("settings") === true) {
                        this.$el.find(".node-child-layer-button").after(this.templateSetting(attr));
                    }
                    else {
                        this.$el.find(".node-child-layer-button").after(this.template(attr));
                    }
                }
                return this;
            },

            /**
             * Bewegt den Layer im LayerBaum innerhalb der entsprechenden TreeNodeChild eine Ebene nach oben oder unten. Zusätzlich wird eine Event an map.js "getriggert",
             * welches den Layer auf der Karte in der Ebene verschiebt. Anschließend wird die TreeNodeChild neu gezeichnet.
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
                // Die ParentView --> TreeNodeChildView
                var parentView = this.model.get("parentView");
                // Alle zur ParentView gehörende ChildViews ( --> alle entsprechende TreeNodeChildLayer)
                var childViews = parentView.model.get("childViews");
                // Der aktuelle Index dieser View innerhalb der ChildViews der ParentView
                var fromIndex = _.indexOf(parentView.model.get("childViews"), this);
                // Der neue Index für diese View
                var toIndex = fromIndex + counter;
                // Bewege diese View nur innerhalb der Range der ChildViews
                if (toIndex < childViews.length && toIndex >= 0) {
                    // löscht diese View aus den ChildViews und fügt sie an neuer Stelle wieder hinzu
                    childViews.splice(toIndex, 0, childViews.splice(fromIndex, 1)[0]);
                    // bewegt den Layer auf der Karte --> Map.js
                    EventBus.trigger('moveLayer', [counter, this.model.get('layer')]);
                    // zeichnet die ChildViews neu
                    this.model.get("parentView").renderChildren();
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
            }
        });

        return TreeNodeChildLayerView;
    });
