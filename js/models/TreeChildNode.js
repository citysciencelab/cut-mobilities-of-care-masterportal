define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList_new',
    'views/TreeNodeChildLayerView',
    'eventbus'
    ], function (_, Backbone, EventBus, Config, LayerList, TreeLayerView, EventBus) {

        var TreeChildNode = Backbone.Model.extend({
            "defaults": {
                isExpanded: false,
                isVisible: false,
                settings: false,
                transparence: 0,
                parentName: "", // Der Name vom übergeordneten TreeNode(Kategorie)
                metaID: ""  // ID vom Metadatensatz
            },
            "initialize": function () {
                // Aller Layer die zu diesem Unterordner gehören
                this.set("layerList", LayerList.where({metaID: this.get("metaID"), kategorieOpendata: this.get("parentName")}));
                this.setLayerListView();
            },
            "setLayerListView": function () {
                var layerView = [];
                _.each(this.get("layerList"), function (layer) {
                    // Ich bin ein Layer eines Unterordner. Wird für das Styling gebraucht.
                    layer.set("layerType", "layerByChildNode");
                    var layerByChildNode = new TreeLayerView({model: layer});
                    layerView.push(layerByChildNode);
                });
                this.set("layerView", layerView);
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
                _.each(this.get("layerList"), function (layer) {
                    layer.set("visibility", this.get("isVisible"));
                }, this);
            },
            "checkVisibilityOfAllChildren": function () {
                var everyTrue = _.every(this.get("layerList"), function (model) {
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
                _.each(this.get("layerList"), function (layer) {
                    layer.set("transparence", this.get("transparence"));
                }, this);
            },
            "setDownTransparence": function (value) {
                if (this.get('transparence') > 0) {
                    this.set('transparence', this.get('transparence') - value);
                }
                _.each(this.get("layerList"), function (layer) {
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

        return TreeChildNode;
    });
