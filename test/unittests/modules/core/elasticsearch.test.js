import ElasticSearch from "@modules/core/elasticsearch.js";
import {expect} from "chai";

describe("check Elastic Search Helper Functions", function () {

    let elasticSearchModel;

    before(function () {
        elasticSearchModel = new ElasticSearch();
    });
    it("search schould return object", function () {
        expect(elasticSearchModel.search("elastic", {query: "meine Anfrage"})).to.be.a("object");
    });
});
