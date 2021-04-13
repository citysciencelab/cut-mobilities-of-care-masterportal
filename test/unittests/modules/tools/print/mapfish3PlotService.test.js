import PrintModel from "@modules/tools/print/mapfish3PlotService.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
const chai = require("chai");

describe("tools/print/model", function () {
    const expect = chai.expect;
    let printModel;

    before(function () {
        printModel = new PrintModel();
    });

    describe("chooseCurrentLayout", function () {
        const layouts = [
            {
                name: "A4 Hochformat"
            },
            {
                name: "A4 Querformat"
            },
            {
                name: "A3 Hochformat"
            },
            {
                name: "A3 Querformat"
            }
        ];

        it("should return the first Layout if currentlayername ist an empty string", function () {
            expect(printModel.chooseCurrentLayout(layouts, "")).is.equal(layouts[0]);
        });
        it("should return the first Layout if currentlayername ist undefined", function () {
            expect(printModel.chooseCurrentLayout(layouts, undefined)).is.equal(layouts[0]);
        });
        it("should return the third Layout if this one is choosen", function () {
            expect(printModel.chooseCurrentLayout(layouts, "A3 Hochformat")).is.equal(layouts[2]);
        });
    });

    describe("sortVisibleLayerListByZindex", function () {
        it("should return an sorted array by input with zIndeces", function () {
            const array = [],
                layer1 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer2 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer3 = new VectorLayer({
                    source: new VectorSource()
                });

            layer1.setZIndex(10);
            layer2.setZIndex(9);
            layer3.setZIndex(11);

            array.push(layer1);
            array.push(layer2);
            array.push(layer3);

            expect(printModel.sortVisibleLayerListByZindex(array)).to.be.an("array")
                .to.include.ordered.members([layer2, layer1, layer3]);
        });

        it("should return an sorted array by input with zIndeces und without indeces", function () {
            const array = [],
                layer1 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer2 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer3 = new VectorLayer({
                    source: new VectorSource()
                });

            layer1.setZIndex(10);
            layer3.setZIndex(9);

            array.push(layer1);
            array.push(layer2);
            array.push(layer3);

            expect(printModel.sortVisibleLayerListByZindex(array)).to.be.an("array")
                .to.include.ordered.members([layer2, layer3, layer1]);
        });

        it("should return an empty array by empty array input", function () {
            expect(printModel.sortVisibleLayerListByZindex([])).to.be.an("array");
        });
    });
});
