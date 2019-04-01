import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/verkehrsstaerken/model.js";

var model;

before(function () {
    model = new Model();
});

describe("tools/gfi/themes/verkehrsstaerken", function () {
    describe("createNewRowName", function () {
        it("Should remove \"_2004\" from \"test_2004\" with year input as string", function () {
            expect(model.createNewRowName("test_2004", "2004")).to.equal("test");
        });
        it("Should remove \"_2004\" from \"test_2004\" with year input as number", function () {
            expect(model.createNewRowName("test_2004", 2004)).to.equal("test");
        });
        it("Should remove \" 2004\" from \"test 2004\" with year input as string", function () {
            expect(model.createNewRowName("test 2004", "2004")).to.equal("test");
        });
        it("Should remove \" 2004\" from \"test 2004\" with year input as number", function () {
            expect(model.createNewRowName("test 2004", 2004)).to.equal("test");
        });
        it("Should return input string this the ending is not \"_[4-digit-String-or-number]\" or \" [4-digit-String-or-number]\"", function () {
            expect(model.createNewRowName("test2004", 2004)).to.equal("test2004");
        });

    });


});
