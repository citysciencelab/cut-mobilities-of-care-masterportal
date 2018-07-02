define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../../../../modules/snippets/slider/model.js");

    describe("snippets/slider/model", function () {
        var model;

        beforeEach(function () {
            model = new Model({
                values: ["123", "542", "2", "6534", "98"]
            });
        });
        describe("parseValues", function () {
            it("should return an array of numbers", function () {
                var parsedValues = model.parseValues(model.get("values")),
                    allValues = _.every(parsedValues, function (value) {
                        return _.isNumber(value);
                    });

                expect(allValues).to.be.true;
            });
        });
    });
});
