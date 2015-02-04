define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList_new',
    'views/TreeLayerView',
    'eventbus'
    ], function (_, Backbone, EventBus, Config, LayerList, TreeLayerView, EventBus) {

        var TreeChildNode = Backbone.Model.extend({
            "defaults": {
                isExpanded: false,
                isVisible: false,
                parentName: "", // Der Name vom übergeordneten TreeNode(Kategorie)
                metaID: ""  // ID vom Metadatensatz
            },
            "initialize": function () {
                this.on("change:isVisible", this.toggleVisibilityChildren, this);
                // Aller Layer die zu diesem Unterordner gehören
                this.set("layerList", LayerList.where({metaID: this.get("metaID"), kategorieOpendata: this.get("parentName")}));
                this.setLayerListView();
            },
            "setLayerListView": function () {
                var layerView = [];
                _.each(this.get("layerList"), function (layer) {
                    // Ich bin ein Layer eines Unterordner. Wird für das Styling gebraucht.
                    layer.set("className", "layerByChildNode");
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
            }
        });

        return TreeChildNode;
    });
