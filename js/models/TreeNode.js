define([
    'underscore',
    'backbone',
    'config',
    'collections/LayerList',
    'models/TreeNodeChild',
    'views/TreeNodeChildView',
    'views/TreeNodeLayerView'
    ], function (_, Backbone, Config, LayerList, TreeNodeChild, TreeNodeChildView, TreeNodeLayerView) {

        var TreeNode = Backbone.Model.extend({

            "defaults": {
                isExpanded: false,
                isStyled: false
            },

            "initialize": function () {
                this.setLayerList();
                this.setChildren();
                this.setSortedLayerList();
                this.setNestedViews();
            },

            /**
             * Alle Layer-Models die zu dieser Node(Kategorie) gehören.
             * Config.tree.layerAttribute = Das Layer-Model-Attribut in dem die jeweilige Kategorie gesetzt ist.
             */
            "setLayerList": function () {
                var layerList = LayerList.getLayerByProperty(Config.tree.layerAttribute, this.get("kategorie"));
                this.set("layerList", layerList);
            },

            /**
             * Alle Layer aus der "layerList" werden in die richtige Reihenfolge gebracht und in das Attribut "children" geschrieben.
             * Es gibt zwei Arten von Children, LAYER-CHILDREN und NODE-CHILDREN. Wenn zu einer Metadaten-ID genau ein Datensatz(Layer) vorhanden ist, handelt es sich um ein LAYER-CHILDREN.
             * Gibt es zu einer Metadaten-ID mehrere Datensätze(Layer), werden diese in einen Unterordner(NODE-Children) zusammgengefasst.
             */
            "setChildren": function () {
                // Zählt die Layer pro Metadaten-ID die in "layerList" vorkommen.
                var countIDs = _.countBy(_.pluck(this.get("layerList"), "attributes"), "metaID");
                // Zwischenspeicher für die NODE-CHILDREN
                var nodeChildren = [];
                // Zwischenspeicher für die LAYER-CHILDREN
                var layerChildren = [];
                // Iteriert über die Metadaten-ID's
                _.each(countIDs, function (value, key) {
                    // Es gibt mehrere Layer
                    if (value > 1) {
                        // Alle Layer zur Metadaten-ID
                        var nodeChildLayerList = _.filter(this.get("layerList"), function (layer) {
                            return layer.attributes.metaID === key;
                        });
                        // Absteigende alphabetische Sortierung der Layer --> Das ABSTEIGENDE ist für das rendern erforderlich
                        nodeChildLayerList = _.sortBy(nodeChildLayerList, function (layer) {
                            return layer.get("name");
                        }).reverse();
                        // NODE-CHILDREN wird als Objekt zwischengespeichert
                        nodeChildren.push({"type": "nodeChild", "name": nodeChildLayerList[0].get("metaName"), "children": nodeChildLayerList});
                    }
                    // Es gibt genau einen Layer
                    else {
                        // Der Layer zur Metadaten-ID
                        var nodeLayer = _.filter(this.get("layerList"), function (layer) {
                            return layer.attributes.metaID === key;
                        });
                        // LAYER-CHILDREN wird als Objekt zwischengespeichert
                        layerChildren.push({"type": "nodeLayer", "name": nodeLayer[0].get("name"), "layer": nodeLayer[0]});
                    }
                }, this);
                // LAYER-CHILDREN und NODE-CHILDREN werden zusammengefügt und absteigend alphabetisch sortiert --> Das ABSTEIGENDE ist für das rendern erforderlich
                this.set("children", _.union(_.sortBy(layerChildren, "name").reverse(), _.sortBy(nodeChildren, "name").reverse()));
            },

            /**
             * Alle Layer-Models aus "children" werden in das Attribut "sortedLayerList" geschrieben.
             * "sortedLayerList" wird für die Map.js gebraucht. Der unterste Layer im Layerbaum wird als erster in der Map.js der Karte hinzugefügt.
             * So wird sichergestellt das die Reihenfolge der Layer im Layerbaum und der Layer auf der Karte dieselbe ist.
             */
            "setSortedLayerList": function () {
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
            "updateSortedLayerList": function () {
                var sortedLayerList = [];
                _.each(this.get("childViews"), function (childView) {
                    if (childView.model.get("type") === "nodeLayer") {
                        sortedLayerList.push(childView.model);
                    }
                    else if (childView.model.get("type") === "nodeChild") {
                        _.each(childView.model.get("childViews"), function (nodeChildView) {
                            sortedLayerList.push(nodeChildView.model);
                        })
                    }
                });
                this.set("sortedLayerList", sortedLayerList);
            },

            /**
             * Erzeugt aus "children" pro Eintrag eine Model/View Komponente und schreibt diese gesammelt in das Attribut "childViews".
             */
            "setNestedViews": function () {
                // Zwischenspeicher für die Views
                var nestedViews = [];
                // Iteriert über "children"
                _.each(this.get("children"), function (child) {
                    if (child.type === "nodeLayer") {
                        // nodeLayerView
                        child.layer.set("type", "nodeLayer");
                        var treeNodeLayerView = new TreeNodeLayerView({model: child.layer});
                        nestedViews.push(treeNodeLayerView);
                    }
                    else if (child.type === "nodeChild") {
                        // nodeChildView
                        var treeNodeChildView = new TreeNodeChildView({model: new TreeNodeChild(child)});
                        nestedViews.push(treeNodeChildView);
                    }
                }, this);
                this.set("childViews", nestedViews);
            },

            "toggleExpand": function () {
                if (this.get('isExpanded') === true) {
                    this.set('isExpanded', false);
                }
                else {
                    this.set('isExpanded', true);
                }
            },

            "moveUpInList": function () {
                this.updateSortedLayerList();
                this.collection.moveNodeUp(this);
            },

            "moveDownInList": function () {
                this.updateSortedLayerList();
                this.collection.moveNodeDown(this);
            }
        });

        return TreeNode;
    });
