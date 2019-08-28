import Model from "@modules/searchbar/gdi/model.js";
import {expect} from "chai";

describe("modules/searchbar/gdi", function () {
    var model = {},
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
    });
    describe("check Defaults and Settings", function () {
        it("minChars Value should be 4", function () {
            expect(model.get("minChars")).to.equal(4);
        });
        it("change of minChars Value should return 5", function () {
            model.setMinChars(5);
            expect(model.get("minChars")).to.equal(5);
        });
        it("ServiceID Value should be 'elastic'", function () {
            expect(model.get("serviceId")).to.equal("elastic");
        });
        it("change of ServiceID Value should return 4711", function () {
            model.setServiceId("4711");
            expect(model.get("serviceId")).to.equal("4711");
        });
        it("queryObject should be an object", function () {
            expect(model.get("queryObject")).to.be.an("object");
        });
    });
    // describe("createQueryString", function () {
    //     var searchString = "festge",
    //         result = "";
    //
    //     it("the created query should be an object", function () {
    //         result = model.createQuery(searchString);
    //         expect(result).to.be.an("object");
    //     });
    // });
});
