define(function (require) {

    var Config = require("config"),
        RawLayerList;

    RawLayerList = Backbone.Collection.extend({
        model: function (attrs) {
            return new Backbone.Model(attrs);
        },
        // URL zur services.json
        url: function () {
            return Radio.request("Util", "getPath", Config.layerConf);
        },
        initialize: function (urlForTest) {
            var channel = Radio.channel("RawLayerList");

            if (urlForTest) {
                this.url = urlForTest;
            }

            channel.reply({
                "getLayerWhere": this.getLayerWhere,
                "getLayerAttributesWhere": this.getLayerAttributesWhere,
                "getLayerListWhere": this.getLayerListWhere,
                "getLayerAttributesList": this.getLayerAttributesList,
                "getDisplayNamesOfFeatureAttributes": this.getDisplayNamesOfFeatureAttributes
            }, this);

            channel.on({
                "addGroupLayer": this.addGroupLayer
            }, this);
            this.fetch({async: false});
        },

        /**
         * Verarbeitet die Objekte aus der services.json und gibt nur diejenigen zurück, die der Collection hinzugefügt werden sollen
         * @param  {Object[]} response - Objekte aus der services.json
         * @return {Object[]} response - Objekte aus der services.json
         */
        parse: function (response) {
            var rawLayerArray = response;

            // Es gibt Layer in einem Dienst, die für unterschiedliche Portale unterschiedliche Daten/GFIs liefern --> z.B. Hochwasserrisikomanagement
            // Da alle Layer demselben Metadatensatz zugordnet sind, werden sie über die Id gelöscht
            if (_.has(Config.tree, "layerIDsToIgnore")) {
                rawLayerArray = this.deleteLayersByIds(rawLayerArray, Config.tree.layerIDsToIgnore);
            }
            // Alle Layer eines Metadatensatzes die nicht dargestellt werden sollen --> z.B. MRH Fachdaten im FHH-Atlas
            if (_.has(Config.tree, "metaIDsToIgnore")) {
                rawLayerArray = this.deleteLayersByMetaIds(rawLayerArray, Config.tree.metaIDsToIgnore);
            }
            // Alle Layer eines Metadatensatzes die gruppiert dargestellt werden sollen --> z.B. Bauschutzbereich § 12 LuftVG Hamburg im FHH-Atlas
            if (_.has(Config.tree, "metaIDsToMerge")) {
                rawLayerArray = this.mergeLayersByMetaIds(rawLayerArray, Config.tree.metaIDsToMerge);
            }
            // Die HVV Layer bekommen Ihre Styles zugeordnet
            // Pro Style wird eine neuer Layer erzeugt
            if (_.has(Config.tree, "layerIDsToStyle")) {
                this.setStyleForHVVLayer(rawLayerArray);
                rawLayerArray = this.cloneByStyle(rawLayerArray);
            }
            return rawLayerArray;
        },

        /**
         * Entfernt Objekte aus der response, die mit einer der übergebenen Ids übereinstimmen
         * @param  {Object[]} response - Objekte aus der services.json
         * @param  {string[]} ids - Ids von Objekten die entfernt werden
         * @return {Object[]} response - Objekte aus der services.json
         */
        deleteLayersByIds: function (response, ids) {
            return _.reject(response, function (element) {
                return _.contains(ids, element.id);
            });
        },

        /**
         * Entfernt Objekte aus der response, die mit einer der übergebenen Metadaten-Ids übereinstimmen
         * @param  {Object[]} response - Objekte aus der services.json
         * @param  {string[]} metaIds - Metadaten-Ids von Objekten die entfernt werden
         * @return {Object[]} response - Objekte aus der services.json
         */
        deleteLayersByMetaIds: function (response, metaIds) {
            return _.filter(response, function (element) {
                return element.datasets.length === 0 || _.contains(metaIds, element.datasets[0].md_id) === false;
            });
        },

        /**
         * Gruppiert Objekte aus der response, die mit einer der übergebenen Metadaten-Ids übereinstimmen
         * @param {Object[]} response - Objekte aus der services.json
         * @param  {string[]} metaIds - Metadaten-Ids von Objekten die gruppiert werden
         * @return {Object[]} response - Objekte aus der services.json
         */
        mergeLayersByMetaIds: function (response, metaIds) {
            var rawLayerArray = response,
                objectsById,
                newObject;

            _.each(metaIds, function (metaID) {
                // Objekte mit derselben Metadaten-Id
                objectsById = _.filter(rawLayerArray, function (layer) {
                    return layer.typ === "WMS" && layer.datasets.length > 0 && layer.datasets[0].md_id === metaID;
                });
                // Das erste Objekt wird kopiert
                if (_.isEmpty(objectsById) === false) {
                    newObject = _.clone(objectsById[0]);
                    // Das kopierte Objekt bekommt den gleichen Namen wie der Metadatensatz
                    newObject.name = objectsById[0].datasets[0].md_name;
                    // Das Attribut layers wird gruppiert und am kopierten Objekt gesetzt
                    newObject.layers = _.pluck(objectsById, "layers").toString();
                    // Das Attribut maxScale wird gruppiert und der höchste Wert am kopierten Objekt gesetzt
                    newObject.maxScale = _.max(_.pluck(objectsById, "maxScale"), function (scale) {
                        return parseInt(scale, 10);
                    });
                    // Das Attribut minScale wird gruppiert und der niedrigste Wert am kopierten Objekt gesetzt
                    newObject.minScale = _.min(_.pluck(objectsById, "minScale"), function (scale) {
                        return parseInt(scale, 10);
                    });
                    // Entfernt alle zu "gruppierenden" Objekte aus der response
                    rawLayerArray = _.difference(rawLayerArray, objectsById);
                    // Fügt das kopierte (gruppierte) Objekt der response hinzu
                    rawLayerArray.push(newObject);
                }
            });

            return rawLayerArray;
        },

        /**
         * Holt sich die HVV-Objekte aus der services.json
         * Fügt den Objekten konfigurierte Attribute aus der config.js über die Id hinzu
         * @param {Object[]} response - Objekte aus der services.json
         * @return {undefined}
         */
        setStyleForHVVLayer: function (response) {
            var styleLayerIDs = _.pluck(Config.tree.layerIDsToStyle, "id"),
                layersByID;

            layersByID = _.filter(response, function (layer) {
                return _.contains(styleLayerIDs, layer.id);
            });
            _.each(layersByID, function (layer) {
                var styleLayer = _.findWhere(Config.tree.layerIDsToStyle, {"id": layer.id}),
                    layerExtended = _.extend(layer, styleLayer);

                return layerExtended;
            });
        },

        /**
         * Aus Objekten mit mehreren Styles, wird pro Style ein neues Objekt erzeugt
         * Das "alte" Objekt wird aus der respnse entfernt
         * @param {Object[]} response - Objekte aus der services.json
         * @return {Object[]} response - Objekte aus der services.json
         */
        cloneByStyle: function (response) {
            var rawLayerArray = response,
                objectsByStyle = _.filter(response, function (model) { // Layer die mehrere Styles haben
                    return typeof model.styles === "object" && model.typ === "WMS";
                });

            // Iteriert über die Objekte
            _.each(objectsByStyle, function (obj) {
                // Iteriert über die Styles
                _.each(obj.styles, function (style, index) {
                    // Objekt wird kopiert
                    var cloneObj = _.clone(obj);

                    // Die Attribute name, Id, etc. werden für das kopierte Objekt gesetzt
                    cloneObj.style = style;
                    cloneObj.legendURL = obj.legendURL[index];
                    cloneObj.name = obj.name[index];
                    cloneObj.id = obj.id + obj.styles[index];
                    cloneObj.styles = obj.styles[index];
                    // Objekt wird der Response hinzugefügt
                    response.splice(_.indexOf(response, obj), 0, cloneObj);
                }, this);
                // Das ursprüngliche Objekt wird gelöscht
                rawLayerArray = _.without(response, obj);
            }, this);

            return rawLayerArray;
        },

        /**
         * Liefert das erste Model zurück, das den Attributen entspricht
         * @param  {Object} attributes Objekt mit der Layerid
         * @return {Backbone.Model[]} - Liste der Models
         */
        getLayerWhere: function (attributes) {
            return this.findWhere(attributes);
        },

        /**
         * Liefert das erste Model zurück, das den Attributen entspricht
         * @param  {Object} attributes Objekt mit der Layerid
         * @return {Backbone.Model[]} - Liste der Models
         */
        getLayerAttributesWhere: function (attributes) {
            return this.findWhere(attributes) ? this.findWhere(attributes).toJSON() : null;
        },

        /**
          * Liefert ein Array aller Models zurück, die mit den übergebenen Attributen übereinstimmen
          * @param  {Object} attributes Objekt mit Attribut zum Suchen
          * @return {Backbone.Model[]} - Liste der Models
          */
        getLayerListWhere: function (attributes) {
            return this.where(attributes);
        },

        /**
         * Liefert ein Array zurück, welches die Modelattribute eines jeden Model enthält
         * @return {Object[]} - Liste der Modelattribute
         */
        getLayerAttributesList: function () {
            return this.toJSON();
        },

        getDisplayNamesOfFeatureAttributes: function (layerId) {
            return this.get(layerId).get("gfiAttributes");
        }
    });

    return RawLayerList;
});
