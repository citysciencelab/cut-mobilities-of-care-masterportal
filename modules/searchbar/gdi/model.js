import "../model";
import * as ElasticSearch from "../../core/elasticsearch";

const GdiModel = Backbone.Model.extend({
    initialize: function () {
        var query = '{"from": 0, "size": 1000, "query": {"wildcard" : { "name" : "schul*" }}}';

        ElasticSearch.search("elastic", query);
    },



});

export default GdiModel;
