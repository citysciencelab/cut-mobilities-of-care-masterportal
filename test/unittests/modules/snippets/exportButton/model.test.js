import {expect} from "chai";
import Model from "@modules/snippets/exportButton/model.js";

describe("snippets/exportButton/model", function () {
    let model;

    before(function () {
        model = new Model({rawData: []});
    });

    describe("refineObject", function () {
        const obj = {
            a: {
                id: "1",
                value: 42
            },
            b: {
                id: "2"
            },
            c: {
                id: "3",
                value: 666
            }
        };

        it("should return an array", function () {
            expect(model.refineObject(obj)).to.be.an("array");
        });

        it("should return an array with the length of 3", function () {
            expect(model.refineObject(obj)).to.have.lengthOf(3);
        });

        it("should return an array with objects and overwritten ids", function () {
            expect(model.refineObject(obj)).to.have.deep.members([{id: "a", value: 42}, {id: "b"}, {id: "c", value: 666}]);
        });
    });
});
