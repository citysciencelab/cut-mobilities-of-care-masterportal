define([
    "backbone",
    "config",
    "eventbus",
    "modules/tree/catalogExtern/nodeChild",
    "modules/tree/catalogExtern/viewNodeChild",
    "modules/tree/catalogExtern/viewNodeLayer"
], function (Backbone, Config, EventBus, NodeChild, NodeChildView, NodeLayerView) {

    var TreeNode = Backbone.Model.extend({

        // Layer die direkt unterhalb der Node liegen, werden in die Variable "nodeLayer" geschrieben und
        // alle Layer die zu einer Child-Node unterhalb dieser Node gehören, in die Variable "nodeChildLayer".
        defaults: {
            isExpanded: false,
            isStyled: false,
            nodeLayer: [],
            nodeChildLayer: []
        },

        initialize: function () {
           this.listenToOnce(this, {
                "change:layerList": this.setChildren,
                "change:children": this.setSortedLayerList,
                "change:sortedLayerList": this.setNestedViews
            });

            this.listenToOnce(EventBus, {
                // empfängt die zu deisem Ordner gehörenden externen Layer
               "layerlist:sendLayerListForExternalNode": this.setLayerList
            });
            // Wird durch das "reset" beim erzeugen der Knoten in CatalogExtern/List getriggert
            // Fordert die Layer die zu diesem Knoten gehören an. (Category ist bei Externen Layern auf "external" gesetzt)
            EventBus.trigger("layerlist:getLayerListForNode", this.get("category"), this.get("name"));

        },

        // Alle Layer bzw. Layer-Models die zu dieser Node gehören
        setLayerList: function (layerList) {
            var context = this;

            this.set("layerList", layerList.filter(function (layer) {
                return layer.attributes.folder === context.get("name");
            }));
        },

        /**
         * Alle Layer aus der "layerList" werden in die richtige Reihenfolge gebracht und in das Attribut "children" geschrieben.
         */
        setChildren: function () {
            this.setChildrenForTree();
            this.set("children", _.union(_.sortBy(this.get("nodeLayer"), "name").reverse(), _.sortBy(this.get("nodeChildLayer"), "name").reverse()));

        },

        /**
         * Alle Layer werden nach ihrer MetaID gruppiert.
         * Gibt es pro MetaID einen Layer, wird er zum Attribut "nodeLayer" hinzugefügt.
         * Gibt es pro MetaID mehrere Layer, werden die Layer zum Attribut "nodeChildLayer" hinzugefügt.
         */
        setChildrenForTree: function () {
            var countByMetaID,
                layerListByID;

            // Gruppiert die Layer nach deren MetaID
            countByMetaID = _.countBy(_.pluck(this.get("layerList"), "attributes"), "parent");
            // Iteriert über die Metadaten-ID's
            _.each(countByMetaID, function (value, key) {
                // Alle Layer der Gruppe (sprich gleiche MetaID)
                layerListByID = _.filter(this.get("layerList"), function (layer) {
                    return layer.attributes.metaID === key;
                });

                // Absteigende alphabetische Sortierung der Layer --> Das ABSTEIGENDE ist für das rendern erforderlich
                layerListByID = _.sortBy(layerListByID, function (layer) {
                    return layer.get("name");
                }).reverse();
                // Gibt es mehrere Layer in der Gruppe werden sie in einem Unterordner (Metadaten-Name) zusammengefasst
                if (layerListByID.length > 1) {
                    // Wenn die Layer keinen Überordner haben bekommen sie beim Parsen der Capabillities das Attribut "noParent"
                    // diese Layer werden einzeln hinzugefügt
                    if (layerListByID[0].get("parent") === "noParent") {
                        _.each(layerListByID, function (layer) {
                              this.push("nodeLayer", {type: "nodeLayer", name: layer.get("parent"), layer: layer});
                        }, this);
                    }
                    else {
                        // Layer mit dem Selben Parent werden in "nodeChildLayer" zusammen hinzugefügt
                        this.push("nodeChildLayer", {type: "nodeChild", name: layerListByID[0].get("parent"), children: layerListByID});
                    }
                }
                else {
                    // Layer zum Attribut "nodeLayer" hinzugefügt
                    this.push("nodeLayer", {type: "nodeLayer", name: layerListByID[0].get("parent"), layer: layerListByID[0]});
                }
            }, this);
        },

        /**
         * Alle Layer-Models aus "children" werden in das Attribut "sortedLayerList" geschrieben.
         * "sortedLayerList" wird für die Map.js gebraucht. Der unterste Layer im Layerbaum wird als erster in der Map.js der Karte hinzugefügt.
         * So wird sichergestellt das die Reihenfolge der Layer im Layerbaum und der Layer auf der Karte dieselbe ist.
         */
        setSortedLayerList: function () {
            // Zwischenspeicher für die Layer (Models)
            var sortedLayerList = [];
            // Iteriert über "children"
            _.each(this.get("children"), function (child) {
                if (child.type === "nodeLayer") {
                    sortedLayerList.push(child.layer);
                }
                else if (child.type === "nodeChild") {
                    // Iteriert über die Children der Node
                    _.each(child.children, function (nodeChildren) {
                        sortedLayerList.push(nodeChildren);
                    });
                }
            });
            this.set("sortedLayerList", sortedLayerList);
        },

        /**
         * "sortedLayerList" wird aktualisiert. Die Layer-Models werden in die gleiche Reihenfolge gebracht wie die Views im Layerbaum.
         */
        updateSortedLayerList: function () {
            var sortedLayerList = [];

            _.each(this.get("childViews"), function (childView) {
                if (childView.model.get("type") === "nodeLayer") {
                    sortedLayerList.push(childView.model);
                }
                else if (childView.model.get("type") === "nodeChild") {
                    _.each(childView.model.get("childViews"), function (nodeChildView) {
                        sortedLayerList.push(nodeChildView.model);
                    });
                }
            });
            this.set("sortedLayerList", sortedLayerList);
        },

        /**
         * Erzeugt aus "children" pro Eintrag eine Model/View Komponente und schreibt diese gesammelt in das Attribut "childViews".
         */
        setNestedViews: function () {
            // Zwischenspeicher für die Views
            var nestedViews = [],
                nodeLayerView,
                nodeChildView;

            // Iteriert über "children"
            _.each(this.get("children"), function (child) {
                if (child.type === "nodeLayer") {
                    console.log("nodeLayer");
                    // nodeLayerView
                    child.layer.set("type", "nodeLayer");
                    nodeLayerView = new NodeLayerView({model: child.layer});
                    nestedViews.push(nodeLayerView);
                }
                else if (child.type === "nodeChild") {
                    // nodeChildView
                    nodeChildView = new NodeChildView({model: new NodeChild(child)});
                    nestedViews.push(nodeChildView);
            }
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

        moveUpInList: function () {
            this.updateSortedLayerList();
            this.collection.moveNodeUp(this);
        },

        moveDownInList: function () {
            this.updateSortedLayerList();
            this.collection.moveNodeDown(this);
        },

        /**
         * Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * {String} attribute - Das Attribut das gesetzt werden soll
         * {whatever} value - Der Wert des Attributs
         */
        push: function (attribute, value) {
            var clonedAttribute = _.clone(this.get(attribute));

            clonedAttribute.push(value);
            this.set(attribute, clonedAttribute);
        }
    });

    return TreeNode;
});
