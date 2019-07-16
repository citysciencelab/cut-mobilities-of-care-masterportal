import ElasticSearch from "@modules/core/elasticsearch.js";
import Model from "@modules/searchbar/gdi/model.js";
import {expect} from "chai";

describe("check Elastic Search Helper Functions", function () {

    var model = {},
        elasticSearchModel,
        config = {
            "minChars": 4,
            "serviceId": "elastic"
        };

    before(function () {
        model = new Model(config);
        elasticSearchModel = new ElasticSearch();
    });
    it("prepareSearchBody should return string", function () {
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"})).to.be.a("string");
    });
    it("prepareSearchBody should return stringyfied JSON", function () {
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, undefined, 10000)).to.be.equal("{\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("prepareSearchBody should have sort order", function () {
        model.setSorting("_score", "desc");
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore null key", function () {
        model.setSorting(null, "desc");
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore undefined key", function () {
        model.setSorting(undefined, "desc");
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore null value", function () {
        model.setSorting("key", null);
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore undefined value", function () {
        model.setSorting("key", undefined);
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore non-numeric value", function () {
        model.setSize("abc");
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore null value", function () {
        model.setSize(null);
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore undefined value", function () {
        model.setSize(undefined);
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, model.get("sorting"), 10000)).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should change size to 500", function () {
        model.setSize(500);
        expect(elasticSearchModel.prepareSearchBody({query: "meine Anfrage"}, {"_score": "desc"}, model.get("size"))).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":500,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
});
