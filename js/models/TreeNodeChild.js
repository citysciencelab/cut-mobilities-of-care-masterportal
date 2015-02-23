define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList',
    'views/TreeNodeChildLayerView',
    'eventbus'
    ], function (_, Backbone, EventBus, Config, LayerList, TreeNodeChildLayerView, EventBus) {

        var TreeNodeChild = Backbone.Model.extend({

            "defaults": {
                isExpanded: false,
                isVisible: false,
                settings: false,
                transparence: 0
            },

            "initialize": function () {
                this.setNestedViews();
            },

            /**
             * Erzeugt aus "children" pro Eintrag eine Model/View Komponente und schreibt diese gesammelt in das Attribut "childViews".
             */
            "setNestedViews": function () {
                var nestedViews = [];
                _.each(this.get("children"), function (child) {
                    child.set("layerType", "nodeChildLayer");
                    // child.set("parentNode", this);
                    var treeNodeChildLayer = new TreeNodeChildLayerView({model: child});
                    nestedViews.push(treeNodeChildLayer);
                }, this);
                this.set("childViews", nestedViews);
            },
            "toggleExpand": function () {
                if (this.get("isExpanded") === true) {
                    this.set("isExpanded", false);
                }
                else {
                    this.set("isExpanded", true);
                }
            },
            "toggleVisibility": function () {
                if (this.get("isVisible") === true) {
                    this.set("isVisible", false);
                }
                else {
                    this.set("isVisible", true);
                }
            },
            "toggleVisibilityChildren": function () {
                _.each(this.get("children"), function (layer) {
                    layer.set("visibility", this.get("isVisible"));
                }, this);
            },
            "checkVisibilityOfAllChildren": function () {
                var everyTrue = _.every(this.get("children"), function (model) {
                    return model.get("visibility") === true;
                });
                // Wenn alle Child-Layer sichtbar sind
                if (everyTrue === true) {
                    this.set("isVisible", true);
                }
                else {
                    this.set("isVisible", false);
                }
            },
            "toggleSettings": function () {
                if (this.get('settings') === true) {
                    this.set({'settings': false});
                }
                else {
                    this.set({'settings': true});
                }
            },
            "setUpTransparence": function (value) {
                if (this.get('transparence') < 90) {
                    this.set('transparence', this.get('transparence') + value);
                }
                _.each(this.get("children"), function (layer) {
                    layer.set("transparence", this.get("transparence"));
                }, this);
            },
            "setDownTransparence": function (value) {
                if (this.get('transparence') > 0) {
                    this.set('transparence', this.get('transparence') - value);
                }
                _.each(this.get("children"), function (layer) {
                    layer.set("transparence", this.get("transparence"));
                }, this);
            },
            "moveUpInList": function () {
                this.get("parentNode").moveChildInList(this.get("name"), 1);
            },
            "moveDownInList": function () {
                this.get("parentNode").moveChildInList(this.get("name"), -1);
            }
        });

        return TreeNodeChild;
    });
