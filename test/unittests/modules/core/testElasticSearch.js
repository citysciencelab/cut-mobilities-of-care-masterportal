import {expect} from "chai";
import * as ElasticSearch from "@modules/core/elasticsearch.js";
import Model from "@modules/searchbar/gdi/model.js";

describe("check Elastic Search Helper Functions", function () {

    var model = {},
        config = {
            "minChars": 4,
            "serviceId": "elastic"
        };

    before(function () {
        model = new Model(config);
    });
    it("prepareSearchBody should return string", function () {
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.an("string");
    });
    it("prepareSearchBody should return stringyfied JSON", function () {
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("prepareSearchBody should have sort order", function () {
        model.setSorting("_score", "desc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore null key", function () {
        model.setSorting(null, "desc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore undefined key", function () {
        model.setSorting(undefined, "desc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore null value", function () {
        model.setSorting("key", null);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore undefined value", function () {
        model.setSorting("key", undefined);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore non-numeric value", function () {
        model.setSize("abc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore null value", function () {
        model.setSize(null);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore undefined value", function () {
        model.setSize(undefined);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should change size to 500", function () {
        model.setSize(500);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":500,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
});
