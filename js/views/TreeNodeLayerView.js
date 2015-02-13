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
                "click .node-layer-button": "toggleSettings"
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
            moveLayer: function (evt) {
                var className = evt.currentTarget.className;
                if (className.search('down') !== -1) {
                    EventBus.trigger('moveLayer', [-1, this.model.get('layer')]);
                }
                else if (className.search('up') !== -1) {
                    EventBus.trigger('moveLayer', [1, this.model.get('layer')]);
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

        return TreeNodeLayerView;
    });
