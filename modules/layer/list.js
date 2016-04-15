define([
    "backbone",
    "backbone.radio",
    "modules/layer/WMSLayer",
    "modules/layer/WFSLayer",
    "modules/layer/GroupLayer",
    "modules/layer/GeoJSONLayer",
    "config",
    "eventbus",
    "modules/featurelister/model" // featureLister muss schon geladen sein, damit dieses Event initial empfangen kann
], function (Backbone, Radio, WMSLayer, WFSLayer, GroupLayer, GeoJSONLayer, Config, EventBus) {

    var LayerList = Backbone.Collection.extend({
        model: function (attrs, options) {
            if (attrs.typ === "WMS") {
                return new WMSLayer(attrs, options);
            }
            else if (attrs.typ === "WFS") {
                return new WFSLayer(attrs, options);
            }
            else if (attrs.typ === "GROUP") {
                return new GroupLayer(attrs, options);
            }
            else if (attrs.typ === "GeoJSON") {
                return new GeoJSONLayer(attrs, options);
            }
        },

        initialize: function () {
            var channel = Radio.channel("LayerList");

            channel.reply({
                "getLayerList": function () {
                    return this.models;
                },
                "getLayerListAttributes": function () {
                    return this.toJSON();
                },
                "getLayerListWhere": function (properties) {
                    return this.where(properties);
                },
                "getLayerFindWhere": function (properties) {
                    return this.findWhere(properties);
                },
                "getOverlayerList": function () {
                    return this.where({isbaselayer: false});
                }
            }, this);

            channel.on({
                "addModel": function (model) {
                    this.add(model);
                },
                "fetchLayer": function () {
                    this.fetchLayer();
                },
                "setAttributionsByID": function (id, attrs) {
                    this.get(id).set(attrs);
                },
                // "toggleLayerVisibleById": function (id) {
                //     this.get(id).toggleSelected();
                // },
                "showLayerInformationById": function (id) {
                    this.get(id).openMetadata();
                }
            }, this);

            this.listenTo(EventBus, {
                "layerlist:getOverlayerList": function () {
                    EventBus.trigger("layerlist:sendOverlayerList", this.where({isbaselayer: false}));
                },
                "layerlist:getVisiblelayerList": function () {
                    EventBus.trigger("layerlist:sendVisiblelayerList", this.where({visibility: true}));
                },
                "layerlist:getVisibleWMSlayerList": function () {
                    EventBus.trigger("layerlist:sendVisibleWMSlayerList", this.where({visibility: true, typ: "WMS"}));
                },
                "layerlist:getVisibleWFSlayerList": function () {
                    var visibleWFS = this.where({visibility: true, typ: "WFS"}),
                        loadedWFS = _.reject(visibleWFS, function (layer) {
                            return layer.get("layer").getSource().getFeatures().length === 0;
                        });

                    EventBus.trigger("layerlist:sendVisibleWFSlayerList", loadedWFS);
                },
                "layerlist:getVisiblePOIlayerList": function () {
                    EventBus.trigger("layerlist:sendVisiblePOIlayerList", this.where({visibility: true, typ: "WFS"}));
                },
                "layerlist:getEditableLayerList": function () {
                    EventBus.trigger("layerlist:sendEditablelayerList", this.where({editable: true}));
                },
                "layerlist:getLayerByID": function (id) {
                    EventBus.trigger("layerlist:sendLayerByID", this.get(id));
                },
                "layerlist:setAttributionsByID": function (id, attrs) {
                    if (this.get(id) !== undefined) {
                        this.get(id).set(attrs);
                    }
                },
                "layerlist:addNewModel": function (model) {
                    this.addExternalLayer(model);
                },
                "layerlist:addModel": function (model) {
                    console.log(model);
                },
                "layerList:sendExternalFolders": this.sendExternalNodeNames,
                "getNodeNames": this.sendNodeNames,
                "layerlist:getLayerListForNode": function (nodeName) {
                    EventBus.trigger("layerlist:sendLayerListForNode", this.where({node: nodeName, isbaselayer: false}));
                },
                "layerlist:getLayerListForExternalNode": function (nodeName) {
                    EventBus.trigger("layerlist:sendLayerListForExternalNode", this.where({node: nodeName, isExternal: true}));
                },
                "layerlist:fetchLayer": this.fetchLayer,
                "addFeatures": this.addFeatures,
                "removeFeatures": this.removeFeatures
            });

            this.listenTo(this, {
                "add": function (model) {
                    EventBus.trigger("addLayerToIndex", [model.get("layer"), this.indexOf(model)]);
                },
                "remove": function (model) {
                    EventBus.trigger("removeLayer", model.get("layer"));
                },
                "change:visibility": function () {
                    var visibleWFS = this.where({visibility: true, typ: "WFS"}),
                        loadedWFS = _.reject(visibleWFS, function (layer) {
                            return layer.get("layer").getSource().getFeatures().length === 0;
                        });

                    EventBus.trigger("layerlist:sendVisibleWFSlayerList", loadedWFS);
                    EventBus.trigger("layerlist:sendVisiblelayerList", this.where({visibility: true}));
                },
                "reset": function (models, options) {
                    var previousModels = options.previousModels;

                    // gelöschte Models müssen auf der Karte immer entfernt werden.
                    if (previousModels.length) {
                        _.each(previousModels, function (prevModel) {
                            EventBus.trigger("removeLayer", prevModel.get("layer"));
                        }, this);
                    }

                    // Special-Ding für HVV --> Layer werden über Styles gesteuert
                    this.cloneByStyle();
                    EventBus.trigger("mapView:getOptions");
                    EventBus.trigger("layerlist:sendOverlayerList", this.where({isbaselayer: false}));
                    if (Config.tree.type === "light") {
                        this.forEach(function (model) {// erst noch removen?
                            EventBus.trigger("addLayerToIndex", [model.get("layer"), this.indexOf(model)]);
                        }, this);
                    }
                    EventBus.trigger("layerlist:sendBaselayerList");
                }
            });
            this.fetchLayer();
        },

        fetchLayer: function () {
            var response = Radio.request("RawLayerList", "getLayerList");

            if (this.length) {
                EventBus.trigger("removeModelFromSelectionList", this.where({"selected": true}));
            }

            // Layerbaum mit Ordnerstruktur
            if (_.has(Config.tree, "type") && Config.tree.type === "default") {
                // nur vom Typ WMS
                response = _.where(response, {typ: "WMS"});
                // nur Layer die min. einen Datensatz zugeordnet sind und solche mit korrekter URL
                response = _.filter(response, function (element) {
                    element.isbaselayer = false;
                    return (element.datasets.length > 0 && element.url !== "nicht vorhanden") ;
                });
                response = this.deleteLayerByID(response);
                response = this.deleteLayersByMetaID(response);
                response = this.deleteLayersIncludeCache(response);
                response = this.mergeLayersByIDs(response);
                response = this.mergeLayersByMetaID(response);
                this.setLayerStyle(response);
                this.setBaseLayer(response);
                response = this.createLayerPerDataset(response);

                this.reset(response);
                this.resetModels();
                this.sendNodeNames();
            }
            // Ansonsten Layer über ID
            else if (_.has(Config.tree, "type") && Config.tree.type === "light" || Config.tree.type === "custom") {
                var modelsArray = [];

                if (_.has(Config.tree, "layerIDsToMerge") === true) {
                    response = this.mergeLayersByIDs(response);
                }

                _.each(Config.tree.layer, function (element) {
                    if (_.has(element, "id") && _.isString(element.id)) {
                        var layers = element.id.split(","),
                            layerinfos = _.findWhere(response, {id: layers[0]});

                        if (_.isUndefined(layerinfos)) {
                            EventBus.trigger("alert", "Der Layer mit der ID '" + element.id + "' ist nicht vorhanden");
                        }
                        else {
                            // element.isbaselayer = false;
                            // für "Singel-Model" z.B.: {id: "5181", visible: false, styles: "strassenbaumkataster_grau", displayInTree: false}
                            if (layers.length === 1) {
                                modelsArray.push(_.extend(layerinfos, element));
                            }
                            // für "Single-Model" mit mehreren Layern(FNP, LAPRO, etc.) z.B.: {id: "550,551,552,553,554,555,556,557,558,559", visible: false}
                            else if (layers.length > 1) {
                                var layerList = "";

                                _.each(layers, function (layer) {
                                    var obj = _.findWhere(response, {id: layer});

                                    layerList += "," + obj.layers;
                                });
                                layerinfos.layers = layerList.slice(1, layerList.length);
                                if (!_.has(element, "name") && layerinfos.datasets.length > 0) {
                                    layerinfos.name = layerinfos.datasets[0].md_name;
                                }
                                modelsArray.push(_.extend(layerinfos, element));
                            }
                        }
                    }
                    // für "Group-Model", mehrere Dienste in einem Model/Layer z.B.: {id: [{ id: "1364" }, { id: "1365" }], visible: false }
                    else if (_.has(element, "id") && _.isArray(element.id)) {
                        var groupModel = {
                            typ: "GROUP",
                            layerdefinitions: []
                        };

                        // element.isbaselayer = false;
                        // Childlayerattributierung
                        _.each(element.id, function (childlayer) {
                            var layerinfos = _.findWhere(response, {id: childlayer.id});

                            if (layerinfos) {
                                groupModel.layerdefinitions.push(layerinfos);
                                groupModel = _.extend(groupModel, element);
                                groupModel.id = _.uniqueId("grouplayer_");
                                modelsArray.push(groupModel);
                            }
                            else {
                                EventBus.trigger("alert", "Der Layer mit der ID '" + childlayer.id + "' ist nicht vorhanden");
                            }
                        });
                    }
                });
                this.setLayerStyle(modelsArray);
                this.reset(modelsArray);
            }
        },

        // Entfernt Layer über die ID. Wird über Config.tree.layerIDsToIgnore gesteuert.
        deleteLayerByID: function (response) {
            return _.reject(response, function (element) {
                return _.contains(Config.tree.layerIDsToIgnore, element.id);
            });
        },

        // Entfernt Layer über ihre MetadatenID. Wird über Config.tree.metaIDsToIgnore gesteuert.
        deleteLayersByMetaID: function (response) {
            return _.reject(response, function (element) {
                return _.contains(Config.tree.metaIDsToIgnore, element.datasets[0].md_id);
            });
        },

        // Entfernt alle Layer, die bereits im Cache dargestellt werden.
        deleteLayersIncludeCache: function (response) {
            var cacheLayerMetaIDs = [],
                cacheLayer = _.where(response, {cache: true});

            _.each(cacheLayer, function (layer) {
                cacheLayerMetaIDs.push(layer.datasets[0].md_id);
            });

            return _.reject(response, function (element) {
                return _.contains(cacheLayerMetaIDs, element.datasets[0].md_id) && element.cache === false;
            });
        },

        // Für Layer mit mehr als 1 Datensatz, wird pro Datensatz 1 zusätzlichen Layer erzeugt.
        createLayerPerDataset: function (response) {
            var layerList = _.filter(response, function (element) {
                return element.datasets.length > 1;
            });

            _.each(layerList, function (layer) {
                _.each(layer.datasets, function (ds, key) {
                    var newLayer = _.clone(layer);

                    newLayer.id = layer.id + "_" + key;
                    newLayer.datasets = [ds];
                    response.push(newLayer);
                });
            });
            return _.filter(response, function (element) {
                return element.datasets.length === 1;
            });
        },

        // Layer mit gleicher Metadaten-ID werden zu einem neuem Layer zusammengefasst.
        // Layer die gruppiert werden sollen, werden über Config.tree.metaIDsToMerge gesteuert.
        // Die zusammenfassenden alten Layer werden rausgefiltert.
        mergeLayersByMetaID: function (response) {
            var newLayer;

            _.each(Config.tree.metaIDsToMerge, function (metaID) {
                var layersByID = _.filter(response, function (layer) {
                    return layer.datasets[0].md_id === metaID;
                });

                newLayer = _.clone(layersByID[0]);
                newLayer.name = layersByID[0].datasets[0].md_name;
                newLayer.layers = _.pluck(layersByID, "layers").toString();
                newLayer.maxScale = _.max(_.pluck(layersByID, "maxScale"), function (scale) {
                    return parseInt(scale, 10);
                });
                newLayer.minScale = _.min(_.pluck(layersByID, "minScale"), function (scale) {
                    return parseInt(scale, 10);
                });
                response = _.difference(response, layersByID);
                response.push(newLayer);
            });
            return response;
        },

        // Mehrere Layer werden zu einem neuem Layer über ihre ID zusammengefasst.
        // Layer die gruppiert werden sollen, werden über Config.tree.layerIDsToMerge gesteuert.
        // Die zusammenfassenden alten Layer werden entfernt.
        mergeLayersByIDs: function (response) {
            _.each(Config.tree.layerIDsToMerge, function (layerIDs) {
                var layersByID,
                    newLayer;

                layersByID = _.filter(response, function (layer) {
                    return _.contains(layerIDs, layer.id);
                });
                newLayer = _.clone(layersByID[0]);
                newLayer.layers = _.pluck(layersByID, "layers").toString();
                newLayer.maxScale = _.max(_.pluck(layersByID, "maxScale"), function (scale) {
                    return parseInt(scale, 10);
                });
                newLayer.minScale = _.min(_.pluck(layersByID, "minScale"), function (scale) {
                    return parseInt(scale, 10);
                });
                response = _.difference(response, layersByID);
                response.push(newLayer);
            });
            return response;
        },

        // Hier wird den HVV-Layern ihr jeweiliger Style zugeordnet.
        setLayerStyle: function (response) {

            var styleLayerIDs = _.pluck(Config.tree.layerIDsToStyle, "id"),
                layersByID;

            layersByID = _.filter(response, function (layer) {
                return _.contains(styleLayerIDs, layer.id);
            });
            _.each(layersByID, function (layer) {
                var styleLayer = _.findWhere(Config.tree.layerIDsToStyle, {"id": layer.id});

                layer = _.extend(layer, styleLayer);
            });
        },

        // Hier werden die Geobasisdaten gesetzt. Wird über Config.baseLayer gesteuert.
        setBaseLayer: function (response) {
            var baseLayerIDs = _.pluck(Config.tree.baseLayer, "id"),
                layersByID;

            layersByID = _.filter(response, function (layer) {
                return _.contains(baseLayerIDs, layer.id);
            });
            _.each(layersByID, function (layer) {
                var baseLayer = _.findWhere(Config.tree.baseLayer, {"id": layer.id});

                layer = _.extend(layer, baseLayer);
                layer.isbaselayer = true;
            });
        },

        // Hier werden Layer verarbeitet für die es nur eine ID gibt, aber mehrere Styles. Zum Beipsiel der HVV-Dienst.
        // Wenn ein Model mehr als einen Style hat, wird pro Style ein neues Model erzeugt. Die ID setzt sich aus dem Style und der ID des "alten" Models zusammen.
        // Das "alte" Model wird danach, wenn es sich dabei um ein "Singel-Model" handelt, gelöscht. "Gruppen-Models" werden lediglich aktualisiert.
        cloneByStyle: function () {
            // "Single" - Layer die mehrere Styles haben
            var modelsByStyle = this.filter(function (model) {
                return typeof model.get("styles") === "object" && model.get("typ") === "WMS";
            });

            // Iteriert über die Models
            _.each(modelsByStyle, function (model) {
                // Iteriert über die Styles
                _.each(model.get("styles"), function (style, index) {
                    // Model wird kopiert
                    var cloneModel = model.clone();
                    // Die Attribute name und die ID werden für das kopierte Model gesetzt
                    cloneModel.set("style", style);
                    cloneModel.set("legendURL", model.get("legendURL")[index]);
                    cloneModel.set("name", model.get("name")[index]);
                    cloneModel.set("id", model.get("id") + model.get("styles")[index].toLowerCase());
                    // Die Source vom Model/Layer bekommt ein Update(neuen Style)
                    cloneModel.get("source").updateParams({STYLES: model.get("styles")[index]});
                    // Model wird der Collection hinzugefügt
                    this.add(cloneModel, {merge: true, at: this.indexOf(model)});
                }, this);
            }, this);
            // Die ursprüngliche Models werden gelöscht
            this.remove(modelsByStyle);

            // Groupen-Layer deren Childlayer sich nur im Style unterscheiden
            var modelsByStyle = this.filter(function (model) {
                return typeof model.get("styles") === "object" && model.get("typ") === "GROUP";
            });

            // Iteriert über die Models
            _.each(modelsByStyle, function (model) {
                // Iteriert über die Childlayer
                model.get("layer").getLayers().forEach(function (layer, index) {
                    // Das STYLES-Attribut der Source wird überschrieben
                    layer.getSource().updateParams({STYLES: model.get("styles")[index]});
                });
            });
        },

        /**
         * Wenn ein Model mehr als einer Kategorie zugeordnet ist, wird pro Kategorie ein Model erzeugt.
         * Das "alte" Model das alle Kategorien enthält wird gelöscht. Damit ist jedes Model einer bestimmten Kategorie zugeordnet.
         */
        resetModels: function () {
            var modelsByCategory, categoryAttribute;

            // Name für das Model-Attribut für die entsprechende Kategorie
            categoryAttribute = "node";
            // Alle Models die mehreren Kategorien zugeordnet sind und damit in einem Array abgelegt sind!
            modelsByCategory = this.filter(function (element) {
                return (typeof element.get(categoryAttribute) === "object" && element.get("isbaselayer") !== true);
            });

            // Iteriert über die Models
            _.each(modelsByCategory, function (element) {
                var categories = element.get(categoryAttribute);
                // Iteriert über die Kategorien
                _.each(categories, function (category) {
                    // Model wird kopiert
                    var cloneModel = element.clone();
                    // Die Attribute Kategorie und die ID werden für das kopierte Model gesetzt
                    cloneModel.set(categoryAttribute, category);
                    cloneModel.set("id", element.id + category.replace(/ /g, "").replace(/,/g, "_").toUpperCase());
                    // Model wird der Collection hinzugefügt
                    this.add(cloneModel, {merge: true});
                }, this);
                // Das ursprüngliche Model wird gelöscht
                this.remove(element);
            }, this);
        },

        // Schiebt das Model in der Collection eine Position nach oben.
        moveModelUp: function (model) {
            var fromIndex = this.indexOf(model),
                toIndex = fromIndex + 1;

            if (fromIndex < this.length - 1) {
                this.remove(model);
                this.add(model, {at: toIndex});
            }
        },

        // Schiebt das Model in der Collection eine Position nach unten.
        moveModelDown: function (model) {
            var fromIndex = this.indexOf(model),
                toIndex = fromIndex - 1;

            if (fromIndex > 0) {
                this.remove(model);
                this.add(model, {at: toIndex});
            }
        },

        sendNodeNames: function () {
            EventBus.trigger("sendNodeNames", this.getNodes());
        },

        getNodes: function () {
            return _.uniq(_.flatten(this.pluck("node")));
        },

        addFeatures: function (name, features) {
            var model = this.findWhere({name: name});

            if (model !== undefined) {
                model.addFeatures(features);
            }
            else {
                this.add({
                    typ: "GeoJSON",
                    name: name,
                    features: features
                });
            }
        },

         sendExternalNodeNames: function () {
            var externalLayers = this.filter(function (model) {
                return model.attributes.isExternal;
            }),
            nodes = [];

            _.each(externalLayers, function (model) {
                nodes.push(model.attributes.node);
            });
            // Sendet die Ordner namen der ersten Ebene
            EventBus.trigger("catalogExtern:sendExternalNodeNames", _.uniq(nodes));
        },

        addExternalLayer: function (model) {
            var externalLayers = this.filter(function (layer) {
                        return layer.get("id").toString().indexOf("External") !== -1;
                    }),
            id = "",
            addedModel = {};

            if (!_.isEmpty(externalLayers)) {

                //  Testet, ob die Layer schon in der Liste ist
                var layerInList = _.find(externalLayers, function (layer) {
                    var attr = layer.attributes,
                    result = false;

                    if (attr.folder === model. folder &&
                        attr.name === model.name &&
                        attr.parent === model.parent &&
                        attr.layers === model.layers) {
                        result = true;
                    }
                    return result;
                });

                // wenn diese Layer schon in derListe ist diese Layer überspringen
                if (layerInList) {
                    return;
                }
                // sucht die Layer mit dem höchsten index
                var max = _.max(externalLayers, function (layer) {
                    // parse int ignoriert das "E" automatisch
                    return parseInt(layer.id, 10);
                });
                // erhöht den höchsten Index um eins und gibt der neuen Layer den erhöhten Index
                id = (parseInt(max.get("id"), 10) + 1).toString() + "External";
            }
            else {
                // Wenn noch keine Externe Layer besteht bekommt die neue diesen Index
                id = "0External";
            }
            addedModel = this.add(_.extend(model, {"id": id}));
        },

        removeFeatures: function (name) {
            var model = this.findWhere({name: name});

            model.removeFeatures();
        }
    });

    return new LayerList();
});
