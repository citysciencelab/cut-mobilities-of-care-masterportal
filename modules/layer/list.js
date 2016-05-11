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
        response: {},

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
                },
                "getResponse": function () {
                    return this.response;
                }
            }, this);

            channel.on({
                "addModel": function (model) {
                    this.add(model);
                },
                "addModelById": function (id) {
                    var model = Radio.request("RawLayerList", "getLayerWhere", {id: id});

                    this.add(model.toJSON());
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

            this.listenToOnce(Radio.channel("MenuBar"), {
                // wird ausgeführt wenn das Menü zwischen mobiler Ansicht und Desktop wechselt
                "switchedMenu": function () {
                    var isMobile = Radio.request("MenuBar", "isMobile");

                    if (isMobile === false && Config.tree.type === "default") {
                        EventBus.trigger("removeModelFromSelectionList", this.where({"selected": true}));
                        this.reset(this.response);
                        this.sendNodeNames();
                    }
                }
            });

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
                "add": function () {
                    // model.setSelected(true);
                    // EventBus.trigger("addLayerToIndex", [model.get("layer"), this.indexOf(model)]);
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
            var response = Radio.request("RawLayerList", "getLayerAttributesList");

            if (this.length) {
                EventBus.trigger("removeModelFromSelectionList", this.where({"selected": true}));
            }

            // Layerbaum mit Ordnerstruktur
            if (_.has(Config.tree, "type") && Config.tree.type === "default") {
                _.each(response, function (element) {
                    element.isbaselayer = false;
                });
                response = this.deleteLayersIncludeCache(response);
                this.setLayerStyle(response);
                this.setBaseLayer(response);
                response = this.createLayerPerDataset(response);
                response = this.cloneObjects(response);
                response = this.cloneByStyle(response);
                if ($(window).width() >= 768) {
                //    this.set("isMobile", false);
                    this.reset(response);
                    this.sendNodeNames();
                    // this.resetModels();
                }
                this.response = response;
            }
            // Ansonsten Layer über ID
            else if (_.has(Config.tree, "type") && Config.tree.type === "light" || Config.tree.type === "custom") {
                var modelsArray = [];

                _.each(Config.tree.layer, function (element) {
                    if (_.has(element, "id") && _.isString(element.id)) {
                        var layers = element.id.split(","),
                            layerinfos = _.findWhere(response, {id: layers[0]});

                        // element.isbaselayer = false;
                        // für "Singel-Model" z.B.: {id: "5181", visible: false, styles: "strassenbaumkataster_grau", displayInTree: false}
                        if (layers.length === 1) {
                            if (!_.isUndefined(layerinfos)) {
                                modelsArray.push(_.extend(layerinfos, element));
                            }
                            else {
                                EventBus.trigger("alert", "Der Layer mit der ID '" + layers[0] + "' ist nicht vorhanden");
                            }
                        }
                        // für "Single-Model" mit mehreren Layern(FNP, LAPRO, etc.) z.B.: {id: "550,551,552,553,554,555,556,557,558,559", visible: false}
                        else if (layers.length > 1) {
                            var layerList = "";

                            _.each(layers, function (layer) {
                                var obj = _.findWhere(response, {id: layer});
                                if (!_.isUndefined(obj)) {
                                    layerList += "," + obj.layers;
                                }
                                else {
                                    EventBus.trigger("alert", "Der Layer mit der ID '" + layer + "' ist nicht vorhanden");
                                }
                            });
                            layerinfos.layers = layerList.slice(1, layerList.length);
                            if (!_.has(element, "name") && layerinfos.datasets.length > 0) {
                                layerinfos.name = layerinfos.datasets[0].md_name;
                            }
                            modelsArray.push(_.extend(layerinfos, element));
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
                modelsArray = this.cloneByStyle(modelsArray);
                this.reset(modelsArray);
            }
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

        // Special-Ding für HVV --> Layer werden über Styles gesteuert
        // Hier werden Layer verarbeitet für die es nur eine ID gibt, aber mehrere Styles. Zum Beipsiel der HVV-Dienst.
        // Wenn ein Model mehr als einen Style hat, wird pro Style ein neues Model erzeugt. Die ID setzt sich aus dem Style und der ID des "alten" Models zusammen.
        // Das "alte" Model wird danach, wenn es sich dabei um ein "Singel-Model" handelt, gelöscht. "Gruppen-Models" werden lediglich aktualisiert.
        cloneByStyle: function (response) {
            // Layer die mehrere Styles haben
            var objectsByStyle = _.filter(response, function (model) {
                return typeof model.styles === "object" && model.typ === "WMS";
            });

            // Iteriert über die Objekte
            _.each(objectsByStyle, function (obj) {
                // Iteriert über die Styles
                _.each(obj.styles, function (style, index) {
                    // Objekt wird kopiert
                    var cloneObj = _.clone(obj);
                    // Die Attribute name und die ID werden für das kopierte Objekt gesetzt
                    cloneObj.style = style;
                    cloneObj.legendURL = obj.legendURL[index];
                    cloneObj.name = obj.name[index];
                    cloneObj.id = obj.id + obj.styles[index].toLowerCase();
                    cloneObj.styles = obj.styles[index];
                    // Objekt wird der Response hinzugefügt
                    response.splice(_.indexOf(response, obj), 0, cloneObj);
                }, this);
                // Das ursprüngliche Objekt wird gelöscht
                response = _.without(response, obj);
            }, this);

            // Groupen-Layer deren Childlayer sich nur im Style unterscheiden
            var modelsByStyle = _.filter(response, function (model) {
                return typeof model.styles === "object" && model.typ === "GROUP";
            });

            // Iteriert über die Models
            _.each(modelsByStyle, function (model, index) {
                model.layerdefinitions[index].styles = model.styles[index];
            });

            return response;
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
        getCategoriesByLayer: function (element) {
            if (Config.tree.orderBy === "opendata") {
                    return element.datasets[0].kategorie_opendata;
                }
            else {
                    return element.datasets[0].kategorie_inspire;
            }
        },

        cloneObjects: function (response) {
            // Name für das Model-Attribut für die entsprechende Kategorie
            // Alle Models die mehreren Kategorien zugeordnet sind und damit in einem Array abgelegt sind!
            var baseLayerIDs = _.pluck(Config.tree.baseLayer, "id"),
                objectsByCategory = _.filter(response, function (element) {
                    return this.getCategoriesByLayer(element).length > 1 && !_.contains(baseLayerIDs, element.id);
                }, this);

            // Iteriert über die Models
            _.each(objectsByCategory, function (element) {
                var categories = this.getCategoriesByLayer(element);

                // Iteriert über die Kategorien
                _.each(categories, function (category) {
                    // Model wird kopiert
                    var cloneModel = _.clone(element);
                    // Die Attribute Kategorie und die ID werden für das kopierte Model gesetzt
                    cloneModel.node = category;
                    // cloneModel.datasets[0].kategorie_inspire = categories[index];
                    cloneModel.id = element.id + category.replace(/ /g, "").replace(/,/g, "_").toUpperCase();
                    // Model wird der Collection hinzugefügt
                    response.push(cloneModel);
                   }, this);
                // Das ursprüngliche Model wird gelöscht
                response = _.without(response, element);
            }, this);
            return response;
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
