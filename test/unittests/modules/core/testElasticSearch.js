import {expect} from "chai";
import * as ElasticSearch from "@modules/core/elasticsearch.js";


describe("check Elastic Search Helper Functions", function () {
    it("prepareSearchBody should return string", function () {
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.an("string");
    });
    it("prepareSearchBody should return stringyfied JSON", function () {
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("prepareSearchBody should have sort order", function () {
        ElasticSearch.setSorting("_score", "desc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore null key", function () {
        ElasticSearch.setSorting(null, "desc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore undefined key", function () {
        ElasticSearch.setSorting(undefined, "desc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore null value", function () {
        ElasticSearch.setSorting("key", null);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSorting should ignore undefined value", function () {
        ElasticSearch.setSorting("key", undefined);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore non-numeric value", function () {
        ElasticSearch.setSize("abc");
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore null value", function () {
        ElasticSearch.setSize(null);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should ignore undefined value", function () {
        ElasticSearch.setSize(undefined);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":10000,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
    it("setSize should change size to 500", function () {
        ElasticSearch.setSize(500);
        expect(ElasticSearch.prepareSearchBody({query: "meine Anfrage"})).to.be.equal("{\"sort\":{\"_score\":\"desc\"},\"from\":0,\"size\":500,\"query\":{\"query\":\"meine Anfrage\"}}");
    });
});
