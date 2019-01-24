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

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
    },

    search: function (searchString) {
        var query = {
            bool: {
                must: [
                    {multi_match:
                        {
                            query: searchString,
                            type: "most_fields",
                            fields: ["datasets.keywords", "name", "datasets.md_name"]
                            // fuzziness: "2"
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

//todo: serviceid aus config übergeben, minchars verarbeiten
        ElasticSearch.search("elastic", query).then(response => {
            if (response.hits) {
                _.each(response.hits, function (hit) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", {
                        name: hit.name,
                        type: "Thema",
                        glyphicon: "glyphicon-map-marker",
                        id: hit.id
                    });
                }, this);
            }

            Radio.trigger("Searchbar", "createRecommendedList");
        });
    }


});

export default GdiModel;
