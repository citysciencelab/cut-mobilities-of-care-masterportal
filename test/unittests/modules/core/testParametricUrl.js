import {expect} from "chai";
import Model from "@modules/core/parametricURL.js";

describe("core/parametricURL", function () {
    var model;

    before(function () {
        model = new Model();
    });

    after(function () {
        window.history.replaceState({}, "", location.origin + "/test/unittests/Testrunner.html");
    });

    describe("updateQueryStringParam", function () {
        before(function () {
            model.updateQueryStringParam("key", "value");
        });

        it("should be a string", function () {
            expect(location.search).to.be.a("string");
        });

        it("should be a string with one key value pair", function () {
            expect(location.search).to.equal("?key=value");
        });

        it("should be a string with two key value pairs", function () {
            model.updateQueryStringParam("newKey", "newValue");
            expect(location.search).to.equal("?key=value&newKey=newValue");
        });

        it("should be updated the first key value pair", function () {
            model.updateQueryStringParam("key", "der_beste_String_aller_Zeiten");
            expect(location.search).to.include("key=der_beste_String_aller_Zeiten");
        });

    });
});
