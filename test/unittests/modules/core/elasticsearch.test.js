import ElasticSearch from "@modules/core/elasticsearch.js";
import Model from "@modules/searchbar/gdi/model.js";
import {expect} from "chai";

describe("check Elastic Search Helper Functions", function () {

    var model = {},
        elasticSearchModel,
        config = {
            "minChars": 4,
            "serviceId": "elastic",
            "queryObject": {
                "id": "query",
                "params": {
                    "query_string": "%%searchString%%"
                }
            }
        };

    before(function () {
        model = new Model(config);
        elasticSearchModel = new ElasticSearch();
    });
    it("search schould return object", function () {
        expect(elasticSearchModel.search("elastic", {query: "meine Anfrage"})).to.be.a("object");
    });
    // it("prepareSearchBody should return string", function () {
    //     expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"})).to.be.a("string");
    // });
    // it("prepareSearchBody should return stringyfied JSON", function () {
    //     expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, undefined, 10000)).to.be.equal("{\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    // });
    // it("prepareSearchBody should have sort order", function () {
    //     model.setSorting("_score", "desc");
    //     expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    // });
});
