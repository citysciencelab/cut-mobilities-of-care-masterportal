define([
    'underscore',
    'backbone',
    'models/wmslayer',
    'models/wfslayer',
    'models/grouplayer',
    'config',
    'eventbus'
    ], function (_, Backbone, WMSLayer, WFSLayer, GroupLayer, Config, EventBus) {

    var LayerList = Backbone.Collection.extend({
        // URL der DiensteAPI
        url: Config.layerConf,
        model: function (attrs, options) {
            if (attrs.typ === 'WMS') {
                return new WMSLayer(attrs, options);
            }
            else if (attrs.typ === 'WFS') {
                return new WFSLayer(attrs, options);
            }
            else if (attrs.typ === 'GROUP') {
                return new GroupLayer(attrs, options);
            }
        },
        parse: function (response) {
            // Layerbaum mit Ordnerstruktur
            if (_.has(Config, "tree") && Config.tree.active === true) {
                // nur vom Typ WMS die einem Datensatz zugeordnet sind
                return _.filter(_.where(response, {typ: "WMS", cache: "false"}), function (element) {
                    return element.datasets.length > 0;
                });
            }
            // Ansonsten Layer über ID
            else if (_.has(Config, "layerIDs")) {
                var configIDs = Config.layerIDs;
                var modelsArray = [];
                _.each(configIDs, function (element, index) {
                    // für "Singel-Model" z.B.: {id: '5181', visible: false, styles: "strassenbaumkataster_grau", displayInTree: false}
                    if (_.has(element, "id") && _.isString(element.id)) {
                        var layers = element.id.split(',');
                        modelsArray.push(_.findWhere(response, {id: layers[0]}));
                        // default: Layer wird im Themenbaum angezeigt
                        if (_.has(element, "displayInTree")) {
                            modelsArray[index].displayInTree = element.displayInTree;
                        }
                        else {
                            modelsArray[index].displayInTree = true;
                        }
                        // WMS-Styles
                        if (_.has(element, "styles")) {
                            modelsArray[index].styles = element.styles;
                            modelsArray[index].name = element.name;
                        }
                        // Transparenz für WMS/WFS
                        if (_.has(element, "opacity")) {
                            modelsArray[index].opacity = element.opacity;
                        }
                        // default: Layer ist nicht sichtbar
                        if (_.has(element, "visible")) {
                            modelsArray[index].visibility = element.visible;
                        }
                        else {
                            modelsArray[index].visibility = false;
                        }
                        // für "Single-Model" mit mehreren Layern(FNP, LAPRO, etc.) z.B.: {id: '550,551,552,553,554,555,556,557,558,559', visible: false}
                        if (layers.length > 1) {
                            var layerList = "";
                            _.each(layers, function (layer) {
                                var obj = _.findWhere(response, {id: layer});
                                layerList += "," + obj.layers;
                            });
                            modelsArray[index].layers = layerList.slice(1, layerList.length);
                            if (!_.has(element, "name")) {
                                modelsArray[index].name = modelsArray[index].datasets[0].md_name;
                            }
                            else {
                                modelsArray[index].name = element.name;
                            }
                        }
                    }
                    // für "Group-Model", mehrere Dienste in einem Model/Layer z.B.: {id: [{ id: '1364' }, { id: '1365' }], visible: false }
                    else if (_.has(element, "id") && _.isArray(element.id)) {
                        var groupModel = {
                            id: _.uniqueId("grouplayer_"),
                            name: element.name,
                            typ: "GROUP",
                            styles: element.styles  // Styles der Childlayer
                        };
                        // Transparenz für Group-Model
                        if (_.has(element, "opacity")) {
                            groupModel.opacity = element.opacity;
                        }
                        var modelChildren = [];
                        //Childlayerattributierung
                        _.each(element.id, function(childlayer, index, list) {
                            modelChildren.push(_.findWhere(response, {id: childlayer.id}));
                        });
                        groupModel.layerdefinitions = modelChildren;
                        // default: Layer wird im Themenbaum angezeigt
                        if (_.has(element, "displayInTree")) {
                            groupModel.displayInTree = element.displayInTree;
                        }
                        else {
                            groupModel.displayInTree = true;
                        }
                        // default: Layer ist nicht sichtbar
                        if (_.has(element, "visible")) {
                            groupModel.visibility = element.visible;
                        }
                        else {
                            groupModel.visibility = false;
                        }
                        modelsArray.push(groupModel);
                    }
                });
                return modelsArray;
            }
        },
        initialize: function () {
            EventBus.on("updateStyleByID", this.updateStyleByID, this);
            EventBus.on("setVisible", this.setVisibleByID, this);
            EventBus.on('getVisibleWFSLayer', this.sendVisibleWFSLayer, this);
            EventBus.on('getVisibleWFSLayerPOI', this.sendVisibleWFSLayerPOI, this);
            EventBus.on("getLayerByCategory", this.sendLayerByProperty, this);
            EventBus.on('getVisibleWMSLayer', this.sendVisibleWMSLayer, this);
            EventBus.on('getAllVisibleLayer', this.sendAllVisibleLayer, this);
            EventBus.on('currentResolution', this.setResolutionForAll, this);

            this.on("change:visibility", this.sendVisibleWFSLayer, this);
            this.on("change:visibility", this.sendAllVisibleLayer, this);

            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    alert("Fehler beim Parsen " + Config.layerConf);
                },
                success: function (collection) {
                    // Nur für Ordnerstruktur im Layerbaum (z.B. FHH-Atlas)
                    if (_.has(Config, "tree") && Config.tree.active === true) {
                        collection.mergeByMetaID();
                        collection.resetModels();
                    }
                    // Special-Ding für HVV --> Layer werden über Styles gesteuert
                    collection.cloneByStyle();
                }
            });
        },
        /**
         * FNP, LAPRO und etc. werden zu einem Model zusammengefasst. Layer die gruppiert werden sollen, werden über Config.tree.groupLayer gesteuert.
         */
        mergeByMetaID: function () {
            // Iteriert über die Metadaten-ID's aus der Config
            _.each(Config.tree.groupLayerByID, function (id) {
                // Alle Models mit der Metadaten-ID
                var modelsByID = this.where({"metaID": id, "cache": "false"});
                // Der Parameter "layers" aus allen Models wird in einer Variable als String gespeichert.
                var layerList = "";
                _.each(modelsByID, function (model) {
                    layerList +=  "," + model.get("layers");
                });
                // Layer aus einem Dienst können unterschiedliche Scales haben (z.B. ALKIS).
                // Daher wird das Model mit dem niedrigsten und das mit dem höchsten Wert gesucht.
                // var minScaleModel = _.min(modelsByID, function (model) {
                //     if (model.get("minScale") === "nicht vorhanden") {
                //         model.set("minScale", "0")
                //     }
                //     return model.get("minScale");
                // });
                // var maxScaleModel = _.max(modelsByID, function (model) {
                //     if (model.get("maxScale") === "nicht vorhanden") {
                //         model.set("maxScale", "500")
                //     }
                //     return model.get("maxScale");
                // });
                // Die Parameter "maxScale", "minScale", "layers" und "name" werden beim ersten Model aus der Liste überschrieben.
                modelsByID[0].set("layers", layerList.slice(1, layerList.length));
                modelsByID[0].set("name", modelsByID[0].get("metaName"));
                // modelsByID[0].set("maxScale", maxScaleModel.get("maxScale"));
                // modelsByID[0].set("minScale", minScaleModel.get("minScale"));

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
                case "opendata":
                    // Name für das Model-Attribut für die entsprechende Kategorie
                    categoryAttribute = "kategorieOpendata";
                    // Alle Models die mehreren Kategorien zugeordnet sind und damit in einem Array abgelegt sind!
                    modelsByCategory = this.filter(function (element) {
                        return (typeof element.get(categoryAttribute) === "object");
                    });
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
                if (typeof model.get(key) === "object") {//console.log(model.get(key));
                    return _.contains(model.get(key), value);
                }
                else {
                    // else noch nicht getestet
                    return model.get(key) === value;
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
            this.get(args[0]).get('source').updateParams({'SLD_BODY': args[1]});
            this.get(args[0]).set('SLDBody', args[1]);
        },
        /**
        * Aktualisiert den Style vom Layer mit SLD_BODY.
        * args[0] = id, args[1] = visibility(bool)
        */
        setVisibleByID: function (args) {
            this.get(args[0]).set('visibility', args[1]);
            this.get(args[0]).get('layer').setVisible(args[1]);
        },
        /**
        *
        */
        sendVisibleWFSLayer: function () {
            EventBus.trigger('sendVisibleWFSLayer', this.getVisibleWFSLayer());
        },
        sendVisibleWFSLayerPOI: function () {
            EventBus.trigger('sendVisibleWFSLayerPOI', this.getVisibleWFSLayer());
        },
        /**
        *
        */
        sendVisibleWMSLayer: function () {
            EventBus.trigger('layerForPrint', this.getVisibleWMSLayer());
        },
        /**
        *
        */
        sendAllVisibleLayer: function () {
            EventBus.trigger('sendAllVisibleLayer', this.getAllVisibleLayer());
        },
        /**
        * Gibt alle Sichtbaren Layer zurück.
        *
        */
        getVisibleWMSLayer: function () {
            return this.where({visibility: true, typ: "WMS"});
        },
        /**
        * Gibt alle Sichtbaren WFS-Layer zurück.
        *
        */
        getVisibleWFSLayer: function () {
            return this.where({visibility: true, typ: "WFS"});
        },
        /**
        * Gibt alle Sichtbaren Layer zurück.
        *
        */
        getAllVisibleLayer: function () {
            return this.where({visibility: true});
        },
        /**
         *
         */
        getAllLayer: function () {
            return this.models;
        },
        /**
         *
         */
         setResolutionForAll: function (resolution) {
             this.forEach(function (model) {
                 model.set("resolution", resolution);
             })
         }
    });

    return new LayerList();
});
