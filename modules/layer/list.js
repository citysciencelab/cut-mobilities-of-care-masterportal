define([
    "backbone",
    "modules/layer/wmslayer",
    "modules/layer/wfslayer",
    "modules/layer/grouplayer",
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
        parse: function (response) {
            // Layerbaum mit Ordnerstruktur
            if (_.has(Config, "tree") && Config.tree.custom === false) {
                // nur vom Typ WMS die einem Datensatz zugeordnet sind
                return _.filter(_.where(response, {typ: "WMS", cache: false}), function (element) {
                    return element.datasets.length > 0;
                });
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
                            if (!_.has(element, "name")) {
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
        initialize: function () {
            EventBus.on("updateStyleByID", this.updateStyleByID, this);
            EventBus.on("getModelById", this.sendModelByID, this);
            EventBus.on("setVisible", this.setVisibleByID, this);
            EventBus.on("getVisibleWFSLayer", this.sendVisibleWFSLayer, this);
            EventBus.on("getVisibleWFSLayerPOI", this.sendVisibleWFSLayerPOI, this);
            EventBus.on("getLayerByCategory", this.sendLayerByProperty, this);
            EventBus.on("getVisibleWMSLayer", this.sendVisibleWMSLayer, this);
            EventBus.on("getAllVisibleLayer", this.sendAllVisibleLayer, this);
            EventBus.on("getAllSelectedLayer", this.sendAllSelectedLayer, this);
            EventBus.on("currentMapScale", this.setMapScaleForAll, this);
            EventBus.on("getInspireFolder", this.sendInspireFolder, this);
            EventBus.on("getOpendataFolder", this.sendOpendataFolder, this);
            EventBus.on("displayInTree", this.displayInTree, this);
            EventBus.on("getAllLayer", this.sendAllLayer, this);
            EventBus.on("getBaseLayer", this.sendBaseLayer, this);

            this.listenTo(EventBus, {
                "addFeatures": this.addFeatures,
                "removeFeatures": this.removeFeatures
            });

            this.on("change:visibility", this.sendVisibleWFSLayer, this);
            this.on("change:visibility", this.sendAllVisibleLayer, this);
            this.listenTo(this, "add", this.addLayerToMap);
            this.listenTo(this, "remove", this.removeLayerFromMap);

            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    alert("Fehler beim Laden von: " + Util.getPath(Config.layerConf));
                },
                success: function (collection) {
                    // Nur für Ordnerstruktur im Layerbaum (z.B. FHH-Atlas)
                    if (_.has(Config, "tree") && Config.tree.custom === false) {
                        collection.mergeByID();
                        collection.mergeByMetaID();
                        collection.resetModels();
                    }
                    // Special-Ding für HVV --> Layer werden über Styles gesteuert
                    collection.cloneByStyle();
                }
            });
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

        /**
         *
         */
        removeFeatures: function (name) {
            var model = this.findWhere({name: name});

            model.removeFeatures();
        },

        mergeByID: function () {
            var modelByID,
                firstModel,
                minScale = [],
                maxScale = [],
                layerList = "";

            // Iteriert über die ID's aus der Config
            _.each(Config.tree.groupBaseLayerByID, function (ids) {
                firstModel = this.get(ids[0]).clone();
                                // console.log(firstModel);
                _.each(ids, function (id) {
                    modelByID = this.get(id);
                    layerList += "," + modelByID.get("layers");
                    minScale.push(parseInt(modelByID.get("minScale"), 10));
                    maxScale.push(parseInt(modelByID.get("maxScale"), 10));
                    this.remove(modelByID);
                }, this);

                firstModel.set("maxScale", _.max(maxScale));
                firstModel.set("minScale", _.min(minScale));
                firstModel.set("layers", layerList.slice(1, layerList.length));
                firstModel.set("isbaselayer", true);
                this.add(firstModel);
                firstModel.reload();
                // console.log(firstModel);
            }, this);
        },

        deleteByID: function () {
            var modelByID;

            // Iteriert über die ID's aus der Config
            _.each(Config.tree.groupBaseLayerByID, function (ids) {
                _.each(ids, function (id) {
                    modelByID = this.get(id);
                    this.remove(modelByID);
                }, this);
            }, this);
        },
        /**
         * FNP, LAPRO und etc. werden zu einem Model zusammengefasst. Layer die gruppiert werden sollen, werden über Config.tree.groupLayer gesteuert.
         */
        mergeByMetaID: function () {
            // Iteriert über die Metadaten-ID's aus der Config
            _.each(Config.tree.groupLayerByID, function (id) {
                // Alle Models mit der Metadaten-ID
                var modelsByID = this.where({"metaID": id, "cache": false}),
                    layerList = ""; // Der Parameter "layers" aus allen Models wird in einer Variable als String gespeichert.

                _.each(modelsByID, function (model) {
                    layerList += "," + model.get("layers");
                });
                // Layer aus einem Dienst können unterschiedliche Scales haben (z.B. ALKIS).
                // Daher wird das Model mit dem niedrigsten und das mit dem höchsten Wert gesucht.
                var minScaleModel = _.min(modelsByID, function (model) {
                    return model.get("minScale");
                }),
                maxScaleModel = _.max(modelsByID, function (model) {
                    return model.get("maxScale");
                });
                // Die Parameter "maxScale", "minScale", "layers" und "name" werden beim ersten Model aus der Liste überschrieben.
                modelsByID[0].set("layers", layerList.slice(1, layerList.length));
                modelsByID[0].set("name", modelsByID[0].get("metaName"));
                modelsByID[0].set("maxScale", maxScaleModel.get("maxScale"));
                modelsByID[0].set("minScale", minScaleModel.get("minScale"));
                // Das erste Model aus der Liste wird kopiert.
                var firstModel = modelsByID[0].clone();
                // Die Liste der Models wird aus der Collection gelöscht.
                this.remove(modelsByID);
                // Das kopierte Model wird zur Collection hinzugefügt.
                this.add(firstModel);
            }, this);
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
                        return (typeof element.get(categoryAttribute) === "object" && element.get("baselayer") !== true);
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
                    cloneModel.set("id", element.id + category.replace(/ /g, ""));
                    // Model wird der Collection hinzugefügt
                    this.add(cloneModel, {merge: true});
                }, this);
                // Das ursprüngliche Model wird gelöscht
                this.remove(element);
            }, this);
        },
        /**
         * Hier werden Layer verarbeitet für die es nur eine ID gibt, aber mehrere Styles. Zum Beipsiel der HVV-Dienst.
         * Wenn ein Model mehr als einen Style hat, wird pro Style ein neues Model erzeugt. Die ID setzt sich aus dem Style und der ID des "alten" Models zusammen.
         * Das "alte" Model wird danach, wenn es sich dabei um ein "Singel-Model" handelt, gelöscht. "Gruppen-Models" werden lediglich aktualisiert.
         */
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
        * [getLayerByProperty description]
        * @param {[type]} key   [description]
        * @param {[type]} value [description]
        */
        getLayerByProperty: function (key, value) {
            return this.filter(function (model) {
                if (model.get("isbaselayer") === false) {
                    if (typeof model.get(key) === "object") { // console.log(model.get(key));
                        return _.contains(model.get(key), value);
                    }
                    else {
                        // else noch nicht getestet
                        return model.get(key) === value;
                    }
                }
            });
        },
        sendLayerByProperty: function (key, value) {
            EventBus.trigger("sendLayerByProperty", this.getLayerByProperty(key, value));
        },
        /**
        * Aktualisiert den Style vom Layer mit SLD_BODY.
        * SLD_BODY wird hier gesetzt. Wird in Print.js für das Drucken von gefilterten Objekten gebraucht.
        * args[0] = id, args[1] = SLD_Body
        */
        updateStyleByID: function (args) {
            this.get(args[0]).get("source").updateParams({SLD_BODY: args[1]});
            this.get(args[0]).set("SLDBody", args[1]);
        },
        /**
         *
         */
        sendModelByID: function (arg) {
            EventBus.trigger("sendModelByID", this.get(arg));
        },
        /**
        *
        * args[0] = id, args[1] = visibility(bool)
        */
        setVisibleByID: function (args) {
            this.get(args[0]).set("visibility", args[1]);
            // this.get(args[0]).get("layer").setVisible(args[1]);
        },
        displayInTree: function (args) {
            this.get(args[0]).set("displayInTree", args[1]);
            // this.get(args[0]).get("layer").setVisible(args[1]);
        },
        /**
        *
        */
        sendVisibleWFSLayer: function () {
            EventBus.trigger("sendVisibleWFSLayer", this.getVisibleWFSLayer());
        },
        sendVisibleWFSLayerPOI: function () {
            EventBus.trigger("sendVisibleWFSLayerPOI", this.getVisibleWFSLayer());
        },
        /**
        *
        */
        sendVisibleWMSLayer: function () {
            EventBus.trigger("sendVisibleWMSLayer", this.getVisibleWMSLayer());
        },
        /**
        *
        */
        sendAllVisibleLayer: function () {
            EventBus.trigger("sendAllVisibleLayer", this.getAllVisibleLayer());
        },
        /**
         *
         */
        sendAllSelectedLayer: function () {
            EventBus.trigger("sendAllSelectedLayer", this.getAllSelectedLayer());
        },
        /**
         *
         */
        sendAllLayer: function () {
            EventBus.trigger("sendAllLayer", this.getAllLayer());
        },
        /**
        * Gibt alle sichtbaren Layer zurück.
        *
        */
        getVisibleWMSLayer: function () {
            return this.where({visibility: true, typ: "WMS"});
        },
        /**
        * Gibt alle sichtbaren WFS-Layer zurück.
        *
        */
        getVisibleWFSLayer: function () {
            return this.where({visibility: true, typ: "WFS"});
        },
        /**
        * Gibt alle sichtbaren Layer zurück.
        *
        */
        getAllVisibleLayer: function () {
            return this.where({visibility: true});
        },
        /**
         * Gibt alle selektierten Layer zurück.
         */
        getAllSelectedLayer: function () {
            return this.where({selected: true});
        },

        /**
         * Alle Layer außer Baselayer --> wird unteranderem für die Themensuche gebraucht
         */
        getAllLayer: function () {
            var baseLayerIDList = _.pluck(Config.baseLayerIDs, "id");

            return _.filter(this.models, function (model) {
                if (!_.contains(baseLayerIDList, model.id)) {
                    return model;
                }
            });
        },

        getBaseLayer: function () {
            var layerlist = [];

            _.each(Config.baseLayerIDs, function (baseLayer) {
                var model = this.findWhere({"id": baseLayer.id});

                if (_.has(baseLayer, "name")) {
                    model.set("name", baseLayer.name);
                }
                if (_.has(baseLayer, "visible")) {
                    model.set("visibility", baseLayer.visible);
                }
                layerlist.push(model);
            }, this);

            return layerlist;
        },

        sendBaseLayer: function () {
            EventBus.trigger("sendBaseLayer", this.getBaseLayer());
        },

        /**
         *
         */
         setMapScaleForAll: function (scale) {
             this.forEach(function (model) {
                 model.set("currentScale", scale);
             });
        },
        /**
         * Schiebt das Model in der Collection eine Position nach oben.
         * @param {Backbone.Model} model - Layer-Model
         */
         moveModelUp: function (model) {
            var fromIndex = this.indexOf(model),
                toIndex = fromIndex + 1;

            if (fromIndex < this.length - 1) {
                this.remove(model);
                this.add(model, {at: toIndex});
            }
        },
        /**
         * Schiebt das Model in der Collection eine Position nach unten.
         * @param {Backbone.Model} model - Layer-Model
         */
         moveModelDown: function (model) {
            var fromIndex = this.indexOf(model),
                toIndex = fromIndex - 1;

            if (fromIndex > 0) {
                this.remove(model);
                this.add(model, {at: toIndex});
            }
        },
        /**
         * Triggert das Event "addLayerToIndex". Übergibt das "layer"-Attribut und den Index vom Model (ol.layer).
         * @param {Backbone.Model} model - Layer-Model
         */
        addLayerToMap: function (model) {
            EventBus.trigger("addLayerToIndex", [model.get("layer"), this.indexOf(model)]);
        },
        /**
         * Triggert das Event "removeLayer". Übergibt das "layer"-Attribut vom Model (ol.layer).
         * @param {Backbone.Model} model - Layer-Model
         */
        removeLayerFromMap: function (model) {
           EventBus.trigger("removeLayer", model.get("layer"));
        },
        getInspireFolder: function () {
            return _.uniq(this.pluck("kategorieInspire"));
        },
        getOpendataFolder: function () {
            return _.uniq(this.pluck("kategorieOpendata"));
        },
        sendInspireFolder: function () {
            this.fetch({
                reset: true,
                cache: false,
                async: false,
                error: function () {
                    alert("Fehler beim Laden von: " + Util.getPath(Config.layerConf));
                },
                success: function (collection) {
                    // Nur für Ordnerstruktur im Layerbaum (z.B. FHH-Atlas)
                    if (_.has(Config, "tree") && Config.tree.custom === false) {
                        // collection.mergeByID();
                        collection.deleteByID();
                        collection.mergeByMetaID();
                        collection.resetModels();
                    }
                    // Special-Ding für HVV --> Layer werden über Styles gesteuert
                    collection.cloneByStyle();
                    EventBus.trigger("sendInspireFolder", collection.getInspireFolder());
                    EventBus.trigger("sendAllLayer", collection.getAllLayer());
                }
            });
        },
        sendOpendataFolder: function () {
            this.fetch({
                reset: true,
                cache: false,
                async: false,
                error: function () {
                    alert("Fehler beim Laden von: " + Util.getPath(Config.layerConf));
                },
                success: function (collection) {
                    // Nur für Ordnerstruktur im Layerbaum (z.B. FHH-Atlas)
                    if (_.has(Config, "tree") && Config.tree.custom === false) {
                        collection.deleteByID();
                        collection.mergeByMetaID();
                        collection.resetModels();
                    }
                    // Special-Ding für HVV --> Layer werden über Styles gesteuert
                    collection.cloneByStyle();
                    EventBus.trigger("sendOpendataFolder", collection.getOpendataFolder());
                    EventBus.trigger("sendAllLayer", collection.getAllLayer());
                }
            });
        }
    });

    return new LayerList();
});
