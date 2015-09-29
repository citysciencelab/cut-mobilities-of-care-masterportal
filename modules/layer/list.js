define([
    "backbone",
    "modules/layer/WMSLayer",
    "modules/layer/WFSLayer",
    "modules/layer/GroupLayer",
    "modules/layer/GeoJSONLayer",
    "config",
    "eventbus",
    "modules/core/util"
], function (Backbone, WMSLayer, WFSLayer, GroupLayer, GeoJSONLayer, Config, EventBus, Util) {

    var LayerList = Backbone.Collection.extend({
        url: Util.getPath(Config.layerConf),
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
            this.listenTo(EventBus, {
                "layerlist:getOverlayerList": function () {
                    EventBus.trigger("layerlist:sendOverlayerList", this.where({isbaselayer: false}));
                },
                "layerlist:getBaselayerList": function () {
                    EventBus.trigger("layerlist:sendBaselayerList", this.where({isbaselayer: true}));
                },
                "layerlist:getVisiblelayerList": function () {
                    EventBus.trigger("layerlist:sendVisiblelayerList", this.where({visibility: true}));
                },
                "layerlist:getVisibleWMSlayerList": function () {
                    EventBus.trigger("layerlist:sendVisibleWMSlayerList", this.where({visibility: true, typ: "WMS"}));
                },
                "layerlist:getVisibleWFSlayerList": function () {
                    EventBus.trigger("layerlist:sendVisibleWFSlayerList", this.where({visibility: true, typ: "WFS"}));
                },
                "layerlist:getLayerByID": function (id) {
                    EventBus.trigger("layerlist:sendLayerByID", this.get(id));
                },
                "layerlist:setAttributionsByID": function (id, attrs) {
                    this.get(id).set(attrs);
                },
                "getNodeNames": this.sendNodeNames,
                "layerlist:getLayerListForNode": this.sendLayerListForNode,
                "layerlist:getInspireFolder": this.fetchLayer,
                "layerlist:getOpendataFolder": this.fetchLayer,
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
                    EventBus.trigger("layerlist:sendVisibleWFSlayerList", this.where({visibility: true, typ: "WFS"}));
                    EventBus.trigger("layerlist:sendVisiblelayerList", this.where({visibility: true}));
                },
                "sync": function () {
                    EventBus.trigger("layerlist:sendOverlayerList", this.where({isbaselayer: false}));
                    if (_.has(Config, "tree") && Config.tree.custom === false) {
                        this.sendNodeNames();
                    }
                    EventBus.trigger("layerlist:updateOverlayerSelection");
                }
            });
            this.fetchLayer();
        },

        // Holt sich die Layer aus der services-*.json.
        // Zuvor werden die Geofachdaten aus der Auswahl gelöscht.
        fetchLayer: function () {
            EventBus.trigger("removeModelFromSelectionList", this.where({"selected": true, "isbaselayer": false}));

            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    alert("Fehler beim Laden von: " + Util.getPath(Config.layerConf));
                },
                success: function (collection) {
                    // Nur für Ordnerstruktur im Layerbaum (z.B. FHH-Atlas)
                    if (_.has(Config, "tree") && Config.tree.custom === false) {
                        collection.resetModels();
                    }
                    // Special-Ding für HVV --> Layer werden über Styles gesteuert
                    collection.cloneByStyle();
                }
            });
        },

        parse: function (response) {
            // Layerbaum mit Ordnerstruktur
            if (_.has(Config, "tree") && Config.tree.custom === false) {
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
                this.setBaseLayer(response);
                response = this.createLayerPerDataset(response);
                return response;
            }
            // Ansonsten Layer über ID
            else if (_.has(Config, "layerIDs")) {
                var modelsArray = [];

                _.each(Config.layerIDs, function (element) {
                    if (_.has(element, "id") && _.isString(element.id)) {
                        var layers = element.id.split(","),
                            layerinfos = _.findWhere(response, {id: layers[0]});

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
                    // für "Group-Model", mehrere Dienste in einem Model/Layer z.B.: {id: [{ id: "1364" }, { id: "1365" }], visible: false }
                    else if (_.has(element, "id") && _.isArray(element.id)) {
                        var groupModel = {
                            typ: "GROUP",
                            layerdefinitions: []
                        };
                        // Childlayerattributierung
                        _.each(element.id, function (childlayer) {
                            var layerinfos = _.findWhere(response, {id: childlayer.id});

                            if (layerinfos) {
                                groupModel.layerdefinitions.push(layerinfos);
                            }
                            else {
                                alert ("Layerbeschreibung " + childlayer.id + " nicht verfügbar.");
                                return;
                            }
                        });
                        groupModel = _.extend(groupModel, element);
                        groupModel.id = _.uniqueId("grouplayer_");
                        modelsArray.push(groupModel);
                    }
                });
                return modelsArray;
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

        // Hier werden die Geobasisdaten gesetzt. Wird über Config.baseLayer gesteuert.
        setBaseLayer: function (response) {
            var baseLayerIDs = _.pluck(Config.baseLayer, "id"),
                layersByID;

            layersByID = _.filter(response, function (layer) {
                return _.contains(baseLayerIDs, layer.id);
            });
            _.each(layersByID, function (layer) {
                var baseLayer = _.findWhere(Config.baseLayer, {"id": layer.id});

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
                    cloneModel.set("name", model.get("name")[index]);
                    cloneModel.set("id", model.get("id") + model.get("styles")[index]);
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

            switch (Config.tree.orderBy) {
                case "opendata": {
                    // Name für das Model-Attribut für die entsprechende Kategorie
                    categoryAttribute = "kategorieOpendata";
                    // Alle Models die mehreren Kategorien zugeordnet sind und damit in einem Array abgelegt sind!
                    modelsByCategory = this.filter(function (element) {
                        return (typeof element.get(categoryAttribute) === "object" && element.get("isbaselayer") !== true);
                    });
                    break;
                }
                case "inspire": {
                    // Name für das Model-Attribut für die entsprechende Kategorie
                    categoryAttribute = "kategorieInspire";
                    // Alle Models die mehreren Kategorien zugeordnet sind und damit in einem Array abgelegt sind!
                    modelsByCategory = this.filter(function (element) {
                        return (typeof element.get(categoryAttribute) === "object" && element.get("isbaselayer") !== true);
                    });
                    break;
                }
            }
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
            if (Config.tree.orderBy === "opendata") {
                EventBus.trigger("sendNodeNames", this.getOpendataFolder());
            }
            else if (Config.tree.orderBy === "inspire") {
                EventBus.trigger("sendNodeNames", this.getInspireFolder());
            }
        },
        sendLayerListForNode: function (category, nodeName) {
            if (category === "opendata") {
                EventBus.trigger("layerlist:sendLayerListForNode", this.where({kategorieOpendata: nodeName, isbaselayer: false}));
            }
            else if (category === "inspire") {
                EventBus.trigger("layerlist:sendLayerListForNode", this.where({kategorieInspire: nodeName, isbaselayer: false}));
            }
            else {
                EventBus.trigger("layerlist:sendLayerListForNode", this.where({kategorieCustom: nodeName, isbaselayer: false}));
            }
        },
        getInspireFolder: function () {
            return _.uniq(_.flatten(this.pluck("kategorieInspire")));
        },
        getOpendataFolder: function () {
            return _.uniq(_.flatten(this.pluck("kategorieOpendata")));
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

        removeFeatures: function (name) {
            var model = this.findWhere({name: name});

            model.removeFeatures();
        }
    });

    return new LayerList();
});
