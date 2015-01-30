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
                return _.filter(_.where(response, {typ: "WMS"}), function (element) {
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
                        // WMS-Styles, speziell für Straßenbaum-Online
                        if (_.has(element, "styles")) {
                            modelsArray[index].styles = element.styles;
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
                        }
                    }
                    // für "Group-Model", mehrere Dienste in einem Model/Layer z.B.: {id: [{ id: '1364' }, { id: '1365' }], visible: false }
                    else if (_.has(element, "id") && _.isArray(element.id)) {
                        var groupModel = {
                            id: _.uniqueId("grouplayer_"),
                            name: element.name,
                            typ: "GROUP"
                        };
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
                        collection.resetModels();
                    }
                }
            });
            console.log(this);
        },
        /**
         * Wenn ein Model mehr als einer Kategorie zugeordnet ist, wird pro Kategorie ein Model erzeugt.
         * Das "alte" Model das alle Kategorien enthält wird gelöscht. Damit ist jedes Model einer bestimmten Kategorie zugeordnet.
         */
        resetModels: function () {console.log("reset");
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
        }
    });

    return new LayerList();
});
