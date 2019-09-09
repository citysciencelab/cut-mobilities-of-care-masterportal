import Model from "@modules/searchbar/gdi/model.js";
import {expect} from "chai";

describe("modules/searchbar/gdi", function () {
    var model = {},
        config = {
            "searchBar": {
                "gdi": {
                    "minChars": 4,
                    "serviceId": "elastic",
                    "queryObject": {
                        "id": "query",
                        "params": {
                            "query_string": "%%searchString%%"
                        }
                    }
                }
            }
        };

    before(function () {
        model = new Model(config);
    });
    describe("check Defaults and Settings", function () {

        it("minChars Value should be 4", function () {
            model.setMinChars(4);
            expect(model.get("minChars")).to.equal(4);
        });
        it("change of minChars Value should return 5", function () {
            model.setMinChars(5);
            expect(model.get("minChars")).to.equal(5);
        });
        it("ServiceID Value should be 'elastic'", function () {
            model.setServiceId("elastic");
            expect(model.get("serviceId")).to.equal("elastic");
        });
        it("change of ServiceID Value should return 4711", function () {
            model.setServiceId("4711");
            expect(model.get("serviceId")).to.equal("4711");
        });
    });
    describe("createQuery", function () {
        var searchString = "festge",
            result = "";

        it("the query should be an object", function () {
            result = model.createQuery(searchString, config.searchBar.gdi);
            expect(result).to.be.a("object");
        });
        it("the query should contain the searched string", function () {
            expect(result.params.query_string).to.equal("festge");
        });
        it("the query should contain orrect params", function () {
            expect(result).to.deep.include({
                "params": {
                    "query_string": "festge"
                }
            });
        });
    });
});
