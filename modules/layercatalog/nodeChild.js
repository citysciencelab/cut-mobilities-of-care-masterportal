define([
    "underscore",
    "backbone",
    "eventbus",
    "config",
    "modules/layer/list",
    "modules/layercatalog/viewNodeChildLayer"
    ], function (_, Backbone, EventBus, Config, LayerList, NodeChildLayerView) {

        var TreeNodeChild = Backbone.Model.extend({

            defaults: {
                isExpanded: false,
                isVisible: false,
                isSelected: false,
                settings: false,
                transparence: 0
            },

            initialize: function () {
                EventBus.trigger("sendNodeChild", this);
                this.setNestedViews();
            },

            /**
             * Erzeugt aus "children" pro Eintrag eine Model/View Komponente und schreibt diese gesammelt in das Attribut "childViews".
             */
            setNestedViews: function () {
                var nestedViews = [];
                _.each(this.get("children"), function (child) {
                    child.set("layerType", "nodeChildLayer");
                    // child.set("parentNode", this);
                    var nodeChildLayer = new NodeChildLayerView({model: child});
                    nestedViews.push(nodeChildLayer);
                }, this);
                this.set("childViews", nestedViews);
            },
            toggleExpand: function () {
                if (this.get("isExpanded") === true) {
                    this.set("isExpanded", false);
                }
                else {
                    this.set("isExpanded", true);
                }
            },
            toggleVisibility: function () {
                if (this.get("isVisible") === true) {
                    this.set("isVisible", false);
                }
                else {
                    this.set("isVisible", true);
                }
            },
            toggleVisibilityChildren: function () {
                _.each(this.get("children"), function (layer) {
                    layer.set("visibility", this.get("isVisible"));
                }, this);
            },
            toggleSelected: function () {
                if (this.get("isSelected") === true) {
                    this.set("isSelected", false);
                }
                else {
                    this.set("isSelected", true);
                    this.set("isExpanded", true);
                }
            },
            toggleSelectedChildren: function () {
                _.each(this.get("children"), function (layer) {
                    layer.set("selected", this.get("isSelected"));
                }, this);
            },
            checkSelectedOfAllChildren: function () {
                var everyTrue = _.every(this.get("children"), function (model) {
                    return model.get("selected") === true;
                });
                // Wenn alle Child-Layer sichtbar sind
                if (everyTrue === true) {
                    this.set("isSelected", true);
                }
                else {
                    this.set("isSelected", false);
                }
            },
            toggleSettings: function () {
                if (this.get("settings") === true) {
                    this.set({settings: false});
                }
                else {
                    this.set({settings: true});
                }
            },
            setUpTransparence: function (value) {
                if (this.get("transparence") < 90) {
                    this.set("transparence", this.get("transparence") + value);
                }
                _.each(this.get("children"), function (layer) {
                    layer.set("transparence", this.get("transparence"));
                }, this);
            },
            setDownTransparence: function (value) {
                if (this.get("transparence") > 0) {
                    this.set("transparence", this.get("transparence") - value);
                }
                _.each(this.get("children"), function (layer) {
                    layer.set("transparence", this.get("transparence"));
                }, this);
            },
            moveUpInList: function () {
                this.get("parentNode").moveChildInList(this.get("name"), 1);
            },
            moveDownInList: function () {
                this.get("parentNode").moveChildInList(this.get("name"), -1);
            }
        });
        return TreeNodeChild;
    });
