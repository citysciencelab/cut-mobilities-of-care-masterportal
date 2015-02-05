define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeLayer.html',
    'text!templates/TreeLayerSetting.html',
    'eventbus'
    ], function ($, _, Backbone, TreeLayerTemplate, TreeLayerSettingTemplate, EventBus) {

        var TreeLayerView = Backbone.View.extend({
            className : 'list-group-item',
            tagName: 'li',
            template: _.template(TreeLayerTemplate),
            templateSetting: _.template(TreeLayerSettingTemplate),
            events: {
                'click .plus': 'upTransparence',
                'click .minus': 'downTransparence',
                'click .info': 'getMetadata',
                'click .check, .unchecked, small': 'toggleVisibility',
                'click .up, .down': 'moveLayer',
                'click .refresh': 'toggleSettings'
            },
            render: function (model) {
                this.stopListening();
                this.listenToOnce(this.model, 'change:visibility', this.render);
                this.listenToOnce(this.model, 'change:transparence', this.render);
                this.listenToOnce(this.model, 'change:settings', this.render);
                this.delegateEvents();
                var attr = this.model.toJSON();

                if (this.model.hasChanged("settings") === true && model !== undefined) {
                    if (this.model.get("settings") === true) {
                        this.animateView(this.templateSetting(attr));
                    }
                    else {
                        this.animateView(this.template(attr));
                    }
                }
                else if (this.model.hasChanged("transparence") === true && model !== undefined) {
                    this.$el.html(this.templateSetting(attr));
                }
                else {
                    if (this.model.get("settings") === true) {
                        this.$el.html(this.templateSetting(attr));
                    }
                    else {
                        this.$el.html(this.template(attr));
                    }
                }
                return this;
            },
            animateView: function (template) {
                this.$el.animate({width: '10%'}, 500, function () {
                    $(this).html(template).animate({width: '100%'}, 500);
                });
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
            }
        });

        return TreeLayerView;
    });
