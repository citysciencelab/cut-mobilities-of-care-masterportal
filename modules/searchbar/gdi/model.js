import "../model";
import * as ElasticSearch from "../../core/elasticsearch";

const GdiModel = Backbone.Model.extend({
    initialize: function () {
        var query = {"wildcard" : { "name" : "schul*" }};

        console.log(ElasticSearch.search("elastic", query));


    },



});

export default GdiModel;
