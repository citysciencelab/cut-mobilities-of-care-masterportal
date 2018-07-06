define(function () {
    var LayerSearch;

    LayerSearch = Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: false,
            minChars: 3
        },
        /**
         * @description Initialisierung der wfsFeature Suche
         * @param {Object} config - Das Konfigurationsobjekt der Tree-Suche.
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @returns {void}
         */
        initialize: function (config) {
            this.listenTo(this, {
                "change:layerList": this.getIdsFromTreeLayers,
                "change:idsFromTreeLayers": this.setUniqLayerList
            });

            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search
            });

            if (config.minChars) {
                this.set("minChars", config.minChars);
            }

            this.getLayerList();
        },

        // @description Lädt initial die Layer in eine Variable.
        // * @param {[Object]} layerModels - Layerlist
        getLayerList: function () {
            var layerList = Radio.request("RawLayerList", "getLayerListWhere", {typ: "WMS"});

            this.set("layerList", layerList);
        },

        getIdsFromTreeLayers: function () {
            var layerList = Radio.request("LayerList", "getLayerListAttributes"),
                idList = _.pluck(layerList, "id");

            _.each(idList, function (id) {
                if (id.split(",").length > 1) {
                    _.each(id.split(","), function (splitId) {
                        idList.push(splitId);
                    });
                    idList = _.without(idList, id);
                }
            });
            this.set("idsFromTreeLayers", idList);
        },

        setUniqLayerList: function () {
            var filteredLayerList = this.filterLayerListByIds(),
                uniqLayerList = _.uniq(filteredLayerList, function (model) {
                    return model.get("name") + model.get("metaID");
                });

            this.set("uniqLayerList", uniqLayerList);
        },

        filterLayerListByIds: function () {
            return _.filter(this.get("layerList"), function (layer) {
                return _.contains(this.get("idsFromTreeLayers"), layer.id) === false;
            }, this);
        },

        search: function (searchString) {
            var searchStringRegExp;

            if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
                this.set("inUse", true);
                searchStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i"); // Erst join dann als regulärer Ausdruck

                this.searchInLayers(searchStringRegExp);
                Radio.trigger("Searchbar", "createRecommendedList");
                this.set("inUse", false);
            }
        },

        /**
         * @description Führt die Suche in der Layervariablen mit Suchstring aus.
         * @param {string} searchStringRegExp - Suchstring als RegExp.
         * @returns {void}
         */
        searchInLayers: function (searchStringRegExp) {
            _.each(this.get("uniqLayerList"), function (layer) {
                var layerName = layer.get("name").replace(/ /g, ""),
                    object;

                if (layerName.search(searchStringRegExp) !== -1) {
                    object = {
                        name: layer.get("name"),
                        type: "Thema",
                        glyphicon: "glyphicon-list",
                        id: layer.get("id"),
                        model: layer
                    };

                    Radio.trigger("Searchbar", "pushHits", "hitList", object);
                }
            }, this);
        }
    });

    return LayerSearch;
});
