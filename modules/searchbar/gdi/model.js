import "../model";
import * as ElasticSearch from "../../core/elasticsearch";

const GdiModel = Backbone.Model.extend({
    defaults: {
        minChars: 3,
        serviceId: ""
    },
    /**
     * @description Initialise GDI-Search via ElasticSearch
     * @param {Object} config - gdi-ConfigObject
     * @param {integer} [config.minChars=3] - minimal number of searchcharacters
     * @param {string} config.serviceId - rest-services Id
     * @returns {void}
     */
    initialize: function (config) {

        if (!_.isUndefined(config.minChars)) {
            this.setMinChars(config.minChars);
        }

        if (!_.isUndefined(config.serviceId)) {
            this.setServiceId(config.serviceId);
        }

        ElasticSearch.setSorting("_score", "desc");


        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
    },

    search: function (searchString) {
        var query = this.createQuery(searchString);

        // ToDo: Event erzeugen und hier antriggern, dass einen passenden Layer erzeugt und anzeigt
        if (searchString.length >= this.getMinChars()) {
            ElasticSearch.search(this.getServiceId(), query).then(response => {
                if (response.hits) {
                    _.each(response.hits, function (hit) {
                        Radio.trigger("Searchbar", "pushHits", "hitList", {
                            name: hit.name,
                            type: "Thema_neu",
                            glyphicon: "glyphicon-map-marker",
                            id: hit.id,
                            triggerEvent: {
                                channel: "unknown",
                                event: "unknown"
                            }
                        });
                    }, this);
                }

                Radio.trigger("Searchbar", "createRecommendedList");
            });
        }
    },
    createQuery: function (searchString) {
        var query = {
            bool: {
                must: [
                    {
                        query_string: {
                            "fields": ["datasets.md_name^2", "name^2", "datasets.keywords"],
                            "query": "*" + searchString + "*",
                            "lowercase_expanded_terms": false
                        }
                    },
                    {match:
                        {
                            typ: "WMS"
                        }
                    }
                ]
            }
        };

        return query;
    },
    setMinChars: function (value) {
        this.set("minChars", value);
    },
    getMinChars: function () {
        return this.get("minChars");
    },
    setServiceId: function (value) {
        this.set("serviceId", value);
    },
    getServiceId: function () {
        return this.get("serviceId");
    }


});

export default GdiModel;
