import "../model";
import ElasticSearch from "../../core/elasticsearch";

const GdiModel = Backbone.Model.extend(/** @lends GdiModel.prototype */{
    defaults: {
        minChars: 3,
        serviceId: "",
        elasticSearch: new ElasticSearch()
    },
    /**
     * @description Initialise GDI-Search via ElasticSearch
     * @param {Object} config - gdi-ConfigObject
     * @param {integer} [config.minChars=3] - minimal number of searchcharacters
     * @param {string} config.serviceId - rest-services Id
     * @returns {void}
     */
    initialize: function (config) {
        var channel = Radio.channel("GDI-Search");

        channel.on({
            "addLayer": this.addLayer
        }, this);

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
        this.listenTo(Radio.channel("Elastic"), {
            "triggerHitList": this.triggerHitList
        });
        if (config.minChars) {
            this.set("minChars", config.minChars);
        }
    },
    /**
     * Searchs layer if enough characters have been touched (if >="minChars")
     * @param {String} searchString - what is searched
     * @returns {void}
     */
    search: function (searchString) {
        var query = this.createQuery(searchString, Radio.request("Parser", "getPortalConfig").searchBar.gdi);

        if (searchString.length >= this.get("minChars")) {
            this.get("elasticSearch").search(this.get("serviceId"), query);
        }
    },
    /**
     * function for the layers that are being searched for
     * @param {String} datasources - layers that have been found
     * @returns {void}
     */
    triggerHitList: function (datasources) {
        if (datasources) {
            _.each(datasources, function (hit) {
                Radio.trigger("Searchbar", "pushHits", "hitList", {
                    name: hit.name,
                    type: "Fachthema",
                    glyphicon: "glyphicon-list",
                    id: hit.id,
                    triggerEvent: {
                        channel: "GDI-Search",
                        event: "addLayer"
                    },
                    source: hit
                });
            }, this);
        }

        Radio.trigger("Searchbar", "createRecommendedList");
    },
    /**
     * creates query for searched string (layer)
     * @param {String} searchString - string that will be touched
     * @param {Object} config - config Parameter
     * @returns {Oject} result
     */
    createQuery: function (searchString, config) {
        var query_object,
            string_query,
            replace_object,
            result;

        if (config) {
            query_object = config.queryObject;
            string_query = JSON.stringify(query_object);
            replace_object = string_query.replace("%%searchString%%", searchString);
            result = JSON.parse(replace_object);
        }
        return result;
    },
    /**
     * Adds found layer to layer tree
     * @param {Object} hit layer to be added
     * @returns {void}
     */
    addLayer: function (hit) {
        var treeType = Radio.request("Parser", "getTreeType"),
            parentId = "tree",
            level = 0,
            layerTreeId;

        if (hit.source) {

            /* Erst mal prüfen, ob es den Layer schon im Themenbaum gibt */
            layerTreeId = Radio.request("Parser", "getItemByAttributes", {id: hit.source.id});
            /* wenn es den Layer noch nicht gibt, diesen aus dem ElasticSearch-Ergebnis erzeugen */
            if (_.isUndefined(layerTreeId)) {

                if (treeType === "custom") {
                    /* Im Custom-Tree erst mal einen neuen Folder erzeugen und diesem den Folder "Ext.Thema" hinzufügen (falls es diese noch nicht gibt) */
                    parentId = "extthema";
                    level = 2;
                    if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}))) {
                        Radio.trigger("Parser", "addFolder", "Externe Fachdaten", "ExternalLayer", "tree", 0);
                        Radio.trigger("ModelList", "renderTree");
                        $("#Overlayer").parent().after($("#ExternalLayer").parent());
                    }
                    if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: parentId}))) {
                        Radio.trigger("Parser", "addFolder", "Fachthema", parentId, "ExternalLayer", 1, true);
                    }
                }

                /* Dann den neuen Layer aus dem ElasicSearch-Ergebnis erzeugen */
                Radio.trigger("Parser",
                    "addGDILayer",
                    {
                        name: hit.source.name,
                        id: hit.source.id,
                        parentId: parentId,
                        level: level,
                        layers: hit.source.layers,
                        url: hit.source.url,
                        version: hit.source.version,
                        gfiAttributes: hit.source.gfiAttributes ? hit.source.gfiAttributes : "showAll",
                        datasets: hit.source.datasets,
                        isJustAdded: true
                    });

                /* und der ModelList hinzufügen */
                Radio.trigger("ModelList", "addModelsByAttributes", {id: hit.source.id});
            }

            Radio.trigger("ModelList", "showModelInTree", hit.source.id);
            if (treeType === "light") {
                Radio.trigger("ModelList", "refreshLightTree");
            }
        }
        else {
            console.error("Es konnte kein Eintrag für Layer " + hit.id + " in ElasticSearch gefunden werden.");
        }
    },
    /**
     * Setter for MinChars
     * @param {Number} value - value for minChars
     * @returns {void}
     */
    setMinChars: function (value) {
        this.set("minChars", value);
    },
    /**
     * Setter for ServiceId
     * @param {Number} value for serviceId
     * @returns {void}
     */
    setServiceId: function (value) {
        this.set("serviceId", value);
    }
});

export default GdiModel;
