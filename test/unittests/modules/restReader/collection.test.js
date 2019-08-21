import Collection from "@modules/restReader/collection.js";
import testRestServices from "../../resources/testRestServices.json";
import {expect} from "chai";

describe("core/RestReader", function () {
    let collection;

    before(function () {
        collection = new Collection(testRestServices, {"url": "abc"});
    });

    describe("constructor", function () {
        it("shouldn't return an empty array", function () {
            expect(collection.models).to.be.an("array").that.is.not.empty;
        });
    });

    describe("getServiceById", function () {
        it("should have at least the attributes 'id', 'name', 'url', 'typ'", function () {
            const model = collection.getServiceById("10");

            expect(model.attributes).to.include.all.keys("id", "name", "url", "typ");
        });
    });
});
